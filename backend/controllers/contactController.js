import ContactMessage from "../models/ContactMessage.js";

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email and message are required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (message.length < 10) {
      return res
        .status(400)
        .json({ message: "Message must be at least 10 characters" });
    }

    const contact = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });
    res
      .status(201)
      .json({
        message: "Message sent successfully",
        contact_id: contact.contact_id,
      });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      order: [["contact_id", "DESC"]],
    });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    await message.destroy();
    res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
};
