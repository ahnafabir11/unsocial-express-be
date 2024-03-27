import { config } from '@/app/config';
import { db } from '@/app/prisma';
import { resend } from '@/app/resend';
import { comparePassword, excludeFields, generateToken, hashPassword, verifyToken } from '@/utils/helper';
import { changePasswordBodySchema, resetPasswordBodySchema, resetPasswordRequestBodySchema } from '@/validators/auth.validator';
import { Request, Response } from 'express';
import { JwtPayload } from 'jsonwebtoken';

type JwtTokenPayload = JwtPayload & { id: string; email: string };

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
      from: config.resendEmailAddress,
      to: [email],
      subject: 'Unsocial change password',
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
      return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: resendError });
    }

    return res.status(200).json({ message: 'EMAIL_SENT', data: null });
  } catch (e) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};

export const changePasswordController = async (req: Request, res: Response) => {
  try {
    // GETTING TOKEN QUERY PARAM
    const token = req.query.token;

    // TOKEN NOT FOUND
    // SENDING ERROR RESPONSE
    if (!token) return res.status(400).json({ message: 'INVALID_TOKEN', data: null });

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

    return res.status(200).json({ message: 'PASSWORD_UPDATED', data: _user });
  } catch (e) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};

export const resetPasswordRequestController = async (req: Request, res: Response) => {
  try {
    const validation = resetPasswordRequestBodySchema.safeParse(req.body);

    // SENDING ERROR RESPONSE FOR VALIDATION ERROR
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'VALIDATION_ERROR', data: errors });
    }

    const user = await db.user.findFirst({ where: { email: validation.data.email } });

    // USER NOT FOUND WITH THE PROVIDED EMAIL
    // SENDING VALIDATION ERROR RESPONSE
    if (!user) return res.status(400).json({ message: 'VALIDATION_ERROR', data: { email: ['Email does not exist!'] } });

    // USER FOUND
    // GENERATING TOKEN FOR COOKIE
    const { id, email, fullName } = user;
    const token = generateToken({ id, email }, { expiresIn: '1h' });

    const resetPasswordLink = encodeURI(`${config.clientOrigin}/auth/change-password?token=${token}`);

    // SENDING RESET PASSWORD LINK
    // USING RESEND (AN EMAIL API SERVICE)
    const { error: resendError } = await resend.emails.send({
      from: config.resendEmailAddress,
      to: [email],
      subject: 'Unsocial reset password',
      html: `
        <h1>Hello ${fullName}</h1>
        <br />
        <a href='${resetPasswordLink}' target='_blank'>
          Click to reset your password.
        </a>
      `,
    });

    // FILED TO SEND EMAIL
    if (resendError) {
      return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: resendError });
    }

    return res.status(200).json({ message: 'VERIFY_EMAIL', data: null });
  } catch (e) {
    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};

export const resetPasswordController = async (req: Request, res: Response) => {
  try {
    // GETTING TOKEN QUERY PARAM
    const token = req.query.token;

    // TOKEN NOT FOUND
    // SENDING ERROR RESPONSE
    if (!token) return res.status(400).json({ message: 'INVALID_TOKEN', data: null });

    // VALIDATING TOKEN
    const { email } = <JwtTokenPayload>verifyToken(String(token));

    const validation = resetPasswordBodySchema.safeParse(req.body);

    // SENDING ERROR RESPONSE FOR VALIDATION ERROR
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'VALIDATION_ERROR', data: errors });
    }

    const { password } = validation.data;

    // HASHING NEW PASSWORD
    const hashedPassword = await hashPassword(password);

    await db.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({ message: 'PASSWORD_UPDATED', data: null });
  } catch (e: any) {
    if (e.name === 'JsonWebTokenError' || e.name === 'TokenExpiredError' || e.name === 'NotBeforeError') {
      return res.status(400).json({ message: 'INVALID_TOKEN', data: null });
    }

    return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};
