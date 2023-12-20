const express = require("express");
const fs = require("fs").promises;
const router = express.Router();
const path = require("path");

const CHANNELS_FILE = path.join(__dirname, "../DB/channels.json");

async function getChannelsData() {
  const data = await fs.readFile(CHANNELS_FILE, "utf8");
  return JSON.parse(data);
}

router.get("/all", async (req, res) => {
  try {
    const channels = await getChannelsData();
    res.json(channels);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving channels", error: error });
  }
});

router.post("/create", async (req, res) => {
  var community_id = req.body.community_id;
  var channel_id = req.body.channel_id;
  var name = req.body.name;
  var info = req.body.info;
  var room_size = req.body.room_size;
  var img_path = req.body.img_path;
  var state_code = req.body.state_code;
  var reg_date = req.body.reg_date;
  var reg_id = req.body.reg_id;
  var edit_date = req.body.edit_date;
  var edit_id = req.body.edit_id;

  var channel = {
    community_id,
    channel_id,
    name,
    info,
    room_size,
    img_path,
    state_code,
    reg_date,
    reg_id,
    edit_date,
    edit_id,
  };
  try {
    const channels = await getChannelsData();
    channels.push(channel);
    await fs.writeFile(
      CHANNELS_FILE,
      JSON.stringify(channels, null, 2),
      "utf8"
    );
    res.json({ message: "Channel created successfully", channel: channel });
  } catch (error) {
    res.status(500).json({ message: "Error saving the member", error: error });
  }
});

router.post("/modify", async (req, res) => {
  var community_id = req.body.community_id;
  var channel_id = req.body.channel_id;
  var name = req.body.name;
  var info = req.body.info;
  var room_size = req.body.room_size;
  var img_path = req.body.img_path;
  var state_code = req.body.state_code;
  var reg_date = req.body.reg_date;
  var reg_id = req.body.reg_id;
  var edit_date = req.body.edit_date;
  var edit_id = req.body.edit_id;

  try {
    let channels = await getChannelsData();
    let channel = channels.find((c) => c.channel_id === channel_id);

    if (channel) {
      channel.community_id = community_id;
      channel.name = name;
      channel.info = info;
      channel.room_size = room_size;
      channel.img_path = img_path;
      channel.state_code = state_code;
      channel.reg_date = reg_date;
      channel.reg_id = reg_id;
      channel.edit_date = edit_date;
      channel.edit_id = edit_id;

      await fs.writeFile(
        CHANNELS_FILE,
        JSON.stringify(channels, null, 2),
        "utf8"
      );
      res.json({ message: "Channel modified successfully", channel: channel });
    } else {
      res.status(404).json({ message: "Channel not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error saving the channel", error: error });
  }
});

router.post("/delete", async (req, res) => {
  var channel_id = req.body.channel_id;

  try {
    let channels = await getChannelsData();

    const index = channels.findIndex((c) => c.channel_id === channel_id);

    if (index !== -1) {
      channels.splice(index, 1);
      await fs.writeFile(
        CHANNELS_FILE,
        JSON.stringify(channels, null, 2),
        "utf8"
      );

      res.json({ message: "Channel deleted successfully" });
    } else {
      res.status(404).json({ message: "Channel not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting the channel", error: error });
  }
});

router.get("/:cid", async (req, res) => {
  try {
    const channelId = parseInt(req.params.cid, 10);
    const channels = await getChannelsData();
    const channel = channels.find((c) => c.channel_id === channelId);

    if (channel) {
      res.json(channel);
    } else {
      res.status(404).json({ message: "Channel not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error retrieving the channel", error: error });
  }
});

module.exports = router;
