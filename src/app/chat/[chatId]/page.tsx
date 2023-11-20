// the route -> /chat/chat-id

import ChatComponent from '@/components/ChatComponent';
import ChatSideBar from '@/components/ChatSideBar';
import PDFViewer from '@/components/PDFViewer';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { auth } from '@clerk/nextjs';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import React from 'react'

//params is an object which contains the dynamic parameters from the url
type Props = {
  params: {
    chatId: string;
  }
}

//this component will be rendered when the route is /chat/chat-id
//({params:{chatId}}: Props) is the same as (props:Props) and then const {chatId} = props.params
const ChatPage = async ({ params: { chatId } }: Props) => {
  const { userId } = await auth();
  if (!userId) {
    return redirect('/sign-in');
  }

  //get the chat from the database
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));

  //if the chat is not found then redirect to the home page
  if (!_chats) {
    return redirect('/');
  }

  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect('/');
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  return (
    <div className='flex max-h-screen overflow-scroll'>
      <div className="flex w-full max-h overflow-scroll">
        {/**chat sidebar */}
        <div className='flex-{1} max-w-xs'>
          <ChatSideBar chatId={parseInt(chatId)} chats={_chats} />
        </div>
        {/**document viewer */}
        <div className='max-h-screen p-4 overflow-scroll flex-[5]'>
          <PDFViewer pdf_url={currentChat?.pdfUrl || ''} />
        </div>
        {/**chat component*/}
        <div className='flex-[3] border-1-4 border-l-slate-200'>
          <ChatComponent/>
        </div>

      </div>
    </div>
  )
}

export default ChatPage;