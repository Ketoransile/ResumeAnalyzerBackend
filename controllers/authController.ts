import { verifyWebhook } from "@clerk/express/webhooks";
import { Request, Response } from "express";
export const createUser = async (req: Request, res: Response) => {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );
    console.log("Webhook payload:", evt.data);

    res.send("Webhook received");
    if (evt.type === "user.created") {
      console.log("userId:", evt.data.id);
    }
  } catch (err) {
    console.error("Error verifying webhook:", err);
    res.status(400).send("Error verifying webhook");
  }
};
