'use server'

import { Jimp } from "jimp";
import jsQR from "jsqr";
import { redirect } from "next/navigation";

const PERMITTED_FILE_TYPES = ["image/png", "image/jpeg"];

const isCorrectImageType = (formEntry: FormDataEntryValue): formEntry is File => {
  const fileType = (formEntry as File).type;
  return PERMITTED_FILE_TYPES.includes(fileType);
}

export const parseQrCodeFromFormData = async (formData: FormData): Promise<string> => {
  const file = formData.get('qrCode');  
  if (!file) {
    throw new Error("Missing file in form data");
  }
  if (file && isCorrectImageType(file)) {
    const arrBuf = await file.arrayBuffer();
    const im = await Jimp.read(arrBuf);
    const uintArr = new Uint8ClampedArray(im.bitmap.data);
    const qrCode = jsQR(uintArr, im.width, im.height);
    if (!qrCode) {
      throw new Error("No QR code found in image file")
    }
    return qrCode.data
  }
  throw new Error("File is of incorrect type");
}

export const openTrack = async (formData: FormData) => {
  try {
    const url = await parseQrCodeFromFormData(formData);
    redirect(`/?spotifyUrl=${encodeURI(url)}`)
  } catch (e: unknown) {
    throw e;
  }
}