import {Request, Response} from "express";
import SierraClient, {SierraStatus} from "@weco/sierra-client";
import {error} from "../app";

export default async function authHandler(sierraClient: SierraClient, req: Request, res: Response) {
  const getRecordResponse = await sierraClient.getPatronRecordByEmail(req.body.email);
  if (getRecordResponse.status === SierraStatus.Success) {
    const validateResponse = await sierraClient.validateCredentials(getRecordResponse.result.barcode, req.body.password);
    if (validateResponse.status === SierraStatus.Success) {
      res.status(200).end();
    } else if (validateResponse.status === SierraStatus.InvalidCredentials) {
      res.status(401).json(error(validateResponse.message));
    } else {
      res.status(500).json(error(validateResponse.message));
    }
  } else if (getRecordResponse.status === SierraStatus.NotFound) {
    res.status(404).json(error(getRecordResponse.message))
  } else {
    res.status(500).json(error(getRecordResponse.message));
  }
}
