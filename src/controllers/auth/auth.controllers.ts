import { config } from '@/app/config';
import { db } from '@/app/prisma';
import { resend } from '@/app/resend';
import { comparePassword, excludeFields, generateToken, hashPassword } from '@/utils/helper';
import { loginBodySchema, signupBodySchema } from '@/validators/auth.validator';
import { Request, Response } from 'express';

export const signupController = async (req: Request, res: Response) => {
  try {
    // VALIDATING REQUEST BODY
    const validation = signupBodySchema.safeParse(req.body);

    // SENDING ERROR RESPONSE FOR VALIDATION ERROR
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'VALIDATION_ERROR', data: errors });
    }

    const { fullName, email, password } = validation.data;

    // CHECKING IF EMAIL ALREADY EXIST
    const hasUser = await db.user.findFirst({ where: { email } });

    // SENDING ERROR RESPONSE AS FIELD ERROR
    if (hasUser) {
      return res.status(400).json({ message: 'VALIDATION_ERROR', data: { email: ['Email already exist!'] } });
    }

    // EMAIL NOT FOUND
    // GENERATING TOKEN AND VERIFICATION LINK
    const token = generateToken({ fullName, email }, { expiresIn: '1h' });
    const verificationLink = encodeURI(`${config.clientOrigin}/account/verify?token=${token}`);

    // SENDING VERIFICATION LINK
    // USING RESEND (AN EMAIL API SERVICE)
    const { error: resendError } = await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: [email],
      subject: 'Unsocial account verification',
      html: `
        <h1>Welcome ${fullName}</h1>
        <br />
        <a href='${verificationLink}' target='_blank'>
          Click to verify your email address.
        </a>
      `,
    });

    // FILED TO SEND VERIFICATION MAIL
    if (resendError) {
      return res.status(400).json({ message: 'INTERNAL_SERVER_ERROR', data: resendError });
    }

    // EMAIL SENT
    // HASHING PASSWORD
    const hashedPassword = await hashPassword(password);

    // CREATING USER WITH PRISMA
    const user = await db.user.create({ data: { fullName, email, password: hashedPassword } });

    const _user = excludeFields(user, ['password']);

    // USER CREATED SUCCESSFULLY
    // SENDING SUCCESS RESPONSE
    return res.status(200).json({ message: 'Verify your email address.', data: _user });
  } catch (e) {
    return res.status(400).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    // VALIDATING REQUEST BODY
    const validation = loginBodySchema.safeParse(req.body);

    // SENDING ERROR RESPONSE FOR VALIDATION ERROR
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return res.status(400).json({ message: 'VALIDATION_ERROR', data: errors });
    }

    const { email, password } = validation.data;

    // CHECKING IF EMAIL ALREADY EXIST
    const user = await db.user.findFirst({ where: { email } });

    // SENDING ERROR RESPONSE AS FIELD ERROR
    if (!user) {
      return res.status(400).json({ message: 'VALIDATION_ERROR', data: { email: ["Email doesn't exist!"] } });
    }

    // USER FOUND
    // CHECKING IF PASSWORD MATCHES
    const passwordMatched = await comparePassword(password, user.password);

    // PASSWORD DIDN'T MATCH
    // SENDING ERROR RESPONSE AS VALIDATION ERROR
    if (!passwordMatched) {
      return res.status(400).json({ message: 'VALIDATION_ERROR', data: { password: ["Password didn't match!"] } });
    }

    // PASSWORD MATCHED
    // GENERATING TOKEN FOR COOKIE
    const token = generateToken({ id: user.id, email: user.email });

    const _user = excludeFields(user, ['password']);

    return res.status(200).cookie('token', token, { httpOnly: true }).json({ message: 'You are logged in', data: _user });
  } catch (e) {
    return res.status(400).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};

export const meController = async (req: Request, res: Response) => {
  try {
    const user = await db.user.findFirst({
      where: { id: req.userId },
    });

    if (!user) {
      return res.status(401).json({ message: 'UNAUTHORIZED', data: null });
    }

    const _user = excludeFields(user, ['password']);

    return res.status(200).json({ message: 'You are logged in', data: _user });
  } catch (e) {
    return res.status(400).json({ message: 'INTERNAL_SERVER_ERROR', data: e });
  }
};
