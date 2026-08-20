
//load session function

import { ChatMessage } from "@core/models/chat-message.model";

private sessions: ChatSession[] = [];

export function loadSession(sessionId:string):void{
  const session = this.sessions.find(s => s.id === sessionId);
  if(session){
    this.currentSession = session;
  } else {
    console.error(`Session with id ${sessionId} not found.`);
  }
}

export function addUserMessage(sessionId: string, message: ChatMessage): void {
  const session = this.sessions.find(s => s.id === sessionId);
  if (session) {
    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
  } else {
    console.error(`Session with id ${sessionId} not found.`);
  }
}

export function addAssistantMessage(sessionId: string, message: ChatMessage): void {
  const session = this.sessions.find(s => s.id === sessionId);
  if (session) {
    session.messages.push(message);
    session.updatedAt = new Date().toISOString();
  } else {
    console.error(`Session with id ${sessionId} not found.`);
  }
}