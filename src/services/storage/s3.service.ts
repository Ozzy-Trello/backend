import * as AWS from "aws-sdk";

export const s3 = new AWS.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
});

export const inits3 = async () => {
  try {
    s3.listBuckets(function (err, data) {
      if (err) {
        console.log(err);
      } else {
        console.log(data.Buckets);
      }
    });
  } catch (error) {
    console.error(error);
  }
};
