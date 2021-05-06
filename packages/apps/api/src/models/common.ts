export function toMessage(reason: string): Message {
  return {
    message: reason,
  };
}

interface Message {
  message: string;
}
