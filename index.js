const express = require("express");
const axios = require("axios");
const fs = require("fs");
const cors = require("cors");
const PNG = require("pngjs").PNG;
const base64Img = require("base64-img");
const { readJsonFile } = require("./utils/utils.js");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); // 解析 JSON 数据
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
const url = "http://127.0.0.1:7860";
const transUrl = "http://127.0.0.1:4888";

app.get("/", async (req, res) => {
  const payload = readJsonFile("./json/guofeng.json");
  let response = await axios.post(`${url}/sdapi/v1/txt2img`, payload);
  let data = response.data;

  for (let i of data.images) {
    let base64Image = i.split(",", 1)[0];
    let filePath = base64Img.imgSync(
      `data:image/png;base64,${base64Image}`,
      "",
      `output-${Date.now()}`
    );

    let pngPayload = {
      image: `data:image/png;base64,${i}`,
    };
  }

  res.send("Images processed and saved.");
});

app.post("/test", async (req, res) => {
  console.log(req.body.prompt);
  let trans = "";
  const payload = readJsonFile("./json/guofeng.json");
  if (req.body.prompt) {
    trans = await getTranslate(req.body.prompt);
  }

  const origin = trans + payload.prompt;
  payload.prompt = origin;
  const imgs = await text2img("realcartoonPixar_v1.safetensors", payload);
  res.send(imgs);
});

app.post("/manghe", async (req, res) => {
  try {
    let trans = "";
    const payload = readJsonFile("./json/manghe.json");
    if (req.body.prompt) {
      trans = await getTranslate(req.body.prompt);
    }
    const origin = trans + payload.prompt;
    payload.prompt = origin;
    const imgs = await text2img(
      "toonyou_beta5Unstable.safetensors [86fca15160]",
      payload
    );
    res.send(imgs);
  } catch (e) {
    res.send(e);
  }
});
app.post("/guofeng", async (req, res) => {
  try {
    let trans = "";
    const payload = readJsonFile("./json/guofeng.json");
    if (req.body.prompt) {
      trans = await getTranslate(req.body.prompt);
    }
    const origin = trans + payload.prompt;
    payload.prompt = origin;
    const imgs = await text2img("realcartoonPixar_v1.safetensors", payload);
    res.send(imgs);
  } catch (e) {
    res.send(e);
  }
});
app.post("/saibo", async (req, res) => {
  try {
    let trans = "";
    const payload = readJsonFile("./json/saibo.json");
    if (req.body.prompt) {
      trans = await getTranslate(req.body.prompt);
    }
    const origin = trans + payload.prompt;
    payload.prompt = origin;
    const imgs = await text2img("samaritan3dCartoon_v10.safetensors", payload);
    res.send([imgs[0]]);
  } catch (e) {
    res.send(e);
  }
});

app.post("/saibosanshi", async (req, res) => {
  try {
    let trans = "";
    const payload = readJsonFile("./json/saiboControlNet.json");
    if (req.body.prompt) {
      trans = await getTranslate(req.body.prompt);
    }
    const origin = payload.prompt + trans;
    payload.prompt = origin;
    payload.alwayson_scripts.controlnet.args[0].input_image = req.body.oriimg;
    payload.alwayson_scripts.controlnet.args[1].input_image = req.body.oriimg;
    const imgs = await text2img("samaritan3dCartoon_v10.safetensors", payload);
    res.send([imgs[0]]);
  } catch (e) {
    res.send(e);
  }
});
app.post("/guofengsanshi", async (req, res) => {
  try {
    let trans = "";
    const payload = readJsonFile("./json/guofengControlNet.json");
    if (req.body.prompt) {
      trans = await getTranslate(req.body.prompt);
    }
    const origin = payload.prompt + trans;
    payload.prompt = origin;
    payload.alwayson_scripts.controlnet.args[0].input_image = req.body.oriimg;
    payload.alwayson_scripts.controlnet.args[1].input_image = req.body.oriimg;
    const imgs = await text2img("realcartoonPixar_v1.safetensors", payload);
    res.send([imgs[0]]);
  } catch (e) {
    res.send(e);
  }
});
app.post("/manghesanshi", async (req, res) => {
  try {
    let trans = "";
    const payload = readJsonFile("./json/mangheControlNet.json");
    if (req.body.prompt) {
      trans = await getTranslate(req.body.prompt);
    }
    const origin = payload.prompt + trans;
    console.log(origin);

    payload.prompt = origin;
    payload.alwayson_scripts.controlnet.args[0].input_image = req.body.oriimg;
    payload.alwayson_scripts.controlnet.args[1].input_image = req.body.oriimg;
    const imgs = await text2img(
      "toonyou_beta5Unstable.safetensors [86fca15160]",
      payload
    );
    res.send(imgs);
  } catch (e) {
    res.send(e);
  }
});
async function getTranslate(text) {
  const payload = {
    text: text,
  };
  let response = await axios.post(`${transUrl}/`, payload);
  return response.data.tran;
}

async function text2img(name, config, vae = "Automatic") {
  let model = {
    sd_model_checkpoint: name,
    sd_vae: vae,
  };
  await axios.post(`${url}/sdapi/v1/options`, model);
  let response = await axios.post(`${url}/sdapi/v1/txt2img`, config);
  let data = response.data;
  const imgs = [];

  for (let i of data.images) {
    let base64Image = i.split(",", 1)[0];
    base64Img.imgSync(
      `data:image/png;base64,${base64Image}`,
      "",
      `output-${Date.now()}`
    );

    let pngPayload = {
      image: `data:image/png;base64,${i}`,
    };
    imgs.push(pngPayload);
  }
  return imgs;
}

app.listen(3888, () => console.log("App is listening on port 3000"));
