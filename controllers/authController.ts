import { verifyWebhook } from "@clerk/express/webhooks";
import { Request, Response } from "express";
import { IUser, User } from "../models/User";
import { dbConnect } from "../utils/dbConnect";
export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const evt = await verifyWebhook(req);

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(
      `Received webhook with ID ${id} and event type of ${eventType}`
    );
    console.log("Webhook payload:", evt.data);

    if (evt.type === "user.created") {
      try {
        console.log("userId:", evt.data.id);
        await dbConnect();
        const { first_name, last_name, email_addresses, image_url } = evt.data;
        const email = email_addresses[0].email_address;
        const user = new User({
          clerkId: evt.data.id,
          firstName: first_name || "",
          lastName: last_name || "",
          email: email || "",
          profileImageUrl: image_url || "",
        });
        const response = await user.save();
        console.log("USer is created succesfully", response);
      } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).send("Error creating user");
        return;
      }
    }
    res.status(200).send("Webhook received and handled");
    return;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    res.status(400).send("Error verifying webhook");
    return;
  }
};
