import { s3 } from "./s3.service";

export const UploadFile = async (file: any) => {
  const uploadParams = {
    Bucket: "ozzy-trello",
    Body: file.buffer,
    Key: file.originalname,
  };
  const res = await s3.upload(uploadParams).promise();
  return res;
};
