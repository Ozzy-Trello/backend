import {
  PutObjectCommand,
  ObjectCannedACL,
  PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { s3 } from "./s3.service";

export const UploadFile = async (file: any) => {
  const uploadParams: PutObjectCommandInput = {
    Bucket: "ozzy-trello",
    Body: file.buffer,
    Key: file.originalname,
    ACL: ObjectCannedACL.public_read,
  };

  try {
    const command = new PutObjectCommand(uploadParams);

    const res = await s3.send(command);

    const fileUrl = `${process.env.S3_ENDPOINT}/${uploadParams.Bucket}/${uploadParams.Key}`;

    return { ...res, fileUrl };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
