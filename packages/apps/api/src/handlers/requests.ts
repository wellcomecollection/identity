export async function getItemRequests(sierraClient: SierraClient, auth0Client: Auth0Client, request: Request, response: Response): Promise<void> {
  const userId: number = getTargetUserId(request);

  const getHolds: APIResponse<{}> = await sierraClient.getPatronHolds(userId);
  
  response.sendStatus(500);
  
//   if (getHolds.status !== ResponseStatus.Success)
//
//   const patronDelete: APIResponse<{}> = await sierraClient.deletePatronRecord(userId);
//   if (patronDelete.status !== ResponseStatus.Success) {
//     if (patronDelete.status === ResponseStatus.NotFound) {
//       response.status(404).json(toMessage(patronDelete.message));
//     } else {
//       response.status(500).json(toMessage(patronDelete.message));
//     }
//     return;
//   }
//
//   response.sendStatus(204);
// }