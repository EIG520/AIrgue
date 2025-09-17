'use server';
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export default async function send(msg: string) {
  console.log("response received");

  console.log(msg);

  return (
    <div>
      <h2>gluh</h2>
    </div>
  );
}