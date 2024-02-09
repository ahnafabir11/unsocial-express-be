import { config } from '@/app/config';
import { db } from '@/app/prisma';
import { resend } from '@/app/resend';
import { comparePassword, excludeFields, generateToken, hashPassword, verifyToken } from '@/utils/helper';
import { changePasswordBodySchema } from '@/validators/auth.validator';
import { Request, Response } from 'express';

export const changePasswordRequestController = async (req: Request, res: Response) => {
  try {
    const user = await db.user.findFirst({ where: { id: req.userId } });

    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND', data: null });

    // GENERATING TOKEN FOR COOKIE
    const { id, email, fullName } = user;
    const token = generateToken({ id, email }, { expiresIn: '1h' });

    const changePasswordLink = encodeURI(`${config.clientOrigin}/account/change-password?token=${token}`);

    // SENDING CHANGE PASSWORD LINK
    // USING RESEND (AN EMAIL API SERVICE)
    const { error: resendError } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: 'Unsocial account verification',
      html: `
        <h1>Hello ${fullName}</h1>
        <br />
        <a href='${changePasswordLink}' target='_blank'>
          Click to change your password.
        </a>
      `,
    });

    // FILED TO SEND EMAIL
    if (resendError) {
      return res.status(400).json({ message: 'INTERNAL_SERVER_ERROR', data: resendError });
    }

    return res.status(200).json({ message: 'Check your email.', data: null });
  } catch (e) {
    return res.status(400).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    // GETTING TOKEN QUERY PARAM
    const token = req.query.token;

    // TOKEN NOT FOUND
    // SENDING ERROR RESPONSE
    if (!token) return res.status(401).json({ message: 'UNAUTHORIZED', data: null });

    // VALIDATING TOKEN
    verifyToken(String(token));

    // VALIDATING REQUEST BODY
    const validation = changePasswordBodySchema.safeParse(req.body);

    // SENDING ERROR RESPONSE FOR VALIDATION ERROR
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'VALIDATION_ERROR', data: errors });
    }

    const { oldPassword, newPassword } = validation.data;

    const user = await db.user.findFirst({ where: { id: req.userId } });

    if (!user) return res.status(404).json({ message: 'USER_NOT_FOUND', data: null });

    // USER FOUND
    // CHECKING IF OLD PASSWORD MATCHES
    const passwordMatched = await comparePassword(oldPassword, user.password);

    // PASSWORD DIDN'T MATCH
    // SENDING ERROR RESPONSE AS VALIDATION ERROR
    if (!passwordMatched) {
      return res.status(400).json({ message: 'VALIDATION_ERROR', data: { oldPassword: ["Password didn't match!"] } });
    }

    // HASHING NEW PASSWORD
    const newHashedPassword = await hashPassword(newPassword);

    const updatedUser = await db.user.update({
      where: { id: req.userId },
      data: {
        password: newHashedPassword,
      },
    });

    const _user = excludeFields(updatedUser, ['password']);

    return res.status(200).json({ message: 'Password has been updated.', data: _user });
  } catch (e) {
    return res.status(400).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};
