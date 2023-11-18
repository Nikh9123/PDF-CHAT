import FileUpload from '@/components/FileUpload';
import { Button } from '@/components/ui/button'
import { UserButton, auth } from '@clerk/nextjs/app-beta'
import { LogIn } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div className=' w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100'>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center" >
          <div className="flex items-center">
            <h1 className=' mr-3 text-5xl font-semibold'>chat with any Doc...</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mt-5">
            {isAuth && (<Button>Got to Chats</Button>)}

          </div>
          <p className='mt-1 text-lg text-slate-500'>
            &quot;Join a vibrant community of millions, spanning students, researchers, and professionals. Instantly find answers, effortlessly grasp complex documents, and unlock a platform for seamless learning and knowledge sharing with the power of AI.&quot;
          </p>
          <div className='w-full mt-4'>
            {isAuth ? (<FileUpload/>) : (
              <Link href={'/sign-in'}>
                <Button>Login to get Started!

                  <LogIn className='w-4 h-4 ml-2' size={24} />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
