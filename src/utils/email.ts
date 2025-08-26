import nodemailer from "nodemailer";
import logger from "./logger";
import * as dotenv from "dotenv";
dotenv.config();

interface EmailOptions {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  attachment?: {
    filename: string;
    content: Buffer;
  };
}

export const sendEmailWithAttachment = async (options: EmailOptions) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 2. Mail options
    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.EMAIL_USER,
      to: Array.isArray(options.to) ? options.to.join(",") : options.to,
      cc: options.cc ? (Array.isArray(options.cc) ? options.cc.join(",") : options.cc) : undefined,
      subject: options.subject,
      text: options.body,
      // attachments: options.attachment
      //   ? [
      //       {
      //         filename: options.attachment.filename,
      //         content: options.attachment.content,
      //       },
      //     ]
      //   : [],
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info("Email sent successfully", { messageId: info.messageId });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error("Error sending email", { error });
    throw error;
  }
};
