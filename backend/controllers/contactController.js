import ContactMessage from "../models/ContactMessage.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const str = (v) => (typeof v === "string" ? v.trim() : "");

export const submitContact = async (req, res) => {
  try {
    const name = str(req.body.name);
    const email = str(req.body.email).toLowerCase();
    const subject = str(req.body.subject) || null;
    const message = str(req.body.message);

    if (!name || !email || !message) {
      return res
        .status(400)
        .json({ message: "Name, email and message are required" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (
      name.length > 100 ||
      email.length > 150 ||
      (subject && subject.length > 200)
    ) {
      return res
        .status(400)
        .json({ message: "Name, email or subject is too long" });
    }

    if (message.length < 10) {
      return res
        .status(400)
        .json({ message: "Message must be at least 10 characters" });
    }

    if (message.length > 5000) {
      return res
        .status(400)
        .json({ message: "Message must be 5000 characters or fewer" });
    }

    const contact = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    return res.status(201).json({
      message: "Message sent successfully",
      contact_id: contact.contact_id,
    });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const where = {};
    if (req.query.unread === "true") where.is_read = false;

    const messages = await ContactMessage.findAll({
      where,
      order: [["contact_id", "DESC"]],
    });
    return res.status(200).json(messages);
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await ContactMessage.count({ where: { is_read: false } });
    return res.status(200).json({ count });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const markMessageRead = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });

    if (!message.is_read) {
      message.is_read = true;
      await message.save();
    }
    return res
      .status(200)
      .json({ message: "Marked as read", contact: message });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByPk(req.params.id);
    if (!message) return res.status(404).json({ message: "Message not found" });
    await message.destroy();
    return res.status(200).json({ message: "Message deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};
