'use client';

import React from 'react'
import { Inbox, Loader2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { uploadToS3 } from '@/lib/s3';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const FileUpload = () => {
  const [uploading, setUploading] = React.useState(false);

  //useMutation hook is used to make the request to the backend in react-query
  const { mutate, isSuccess } = useMutation({
    mutationFn: async (
      { file_key, file_name }:
        {
          file_key: string; file_name: string;
        }) => {
          
      //make the request to the backend
      const response = await axios.post('/api/create-chat', {
        file_key,
        file_name
      });
      return response.data;
    }
  });



  //accecpt the pdf,word and ppt files
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"], "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        //bigger than 10 mb
        toast.error("File size is too big");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadToS3(file);

        // !data?.file_key || !data?.file_name means if data.file_key is null or undefined then it will return true
        if (!data?.file_key || !data.file_name) {
          toast.error("Error uploading file");
          return;
        }
        //call the mutate function 
        mutate(data, {
          onSuccess: (data) => {
            console.log("pages from fileUpload : ", data);
            toast.success("Chat created successfully");
          },
          onError: (error) => {
            toast.error("Error creating chats");
            console.log("error from fileUpload : ", error);
          }
        });
        console.log("data : ", data);
      } catch (error) {
        console.log(error);
      } finally {
        setUploading(false);
      }

    }
  });
  return (
    <div className='p-2 bg-white rounded-xl'>
      <div {...getRootProps({
        className: "border-dashed border-2 rounded-xl bg-gray-50 cursor-pointer py-8 flex justify-center items-center flex-col"
      })}>
        <input {...getInputProps} />
        {uploading? (
          <>
            {/*show a loader */}
            <Loader2 className='w-10 h-10 text-blue-500 animate-spin' />
            <p className='mt-2 text-sm text-slate-400'>Get a Coffee! doument is uploading...</p>
          </>
        ) : (
          <>
            <Inbox className='w-10 h-10 text-blue-500' />
            <p className='mt-2 text-sm text-state'>Drag and drop a Doc here</p>
          </>
        )}

      </div>
    </div>
  )
}

export default FileUpload;