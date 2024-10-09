import React from 'react'

import { MdOutlinePushPin } from 'react-icons/md';
import { MdCreate, MdDelete } from 'react-icons/md'
import moment from 'moment';

const NoteCard = ({
    title, 
    date, 
    content, 
    tags, 
    isPinned, 
    onEdit, 
    onDelete, 
    onPinNote 
}) => {
  return (
    <div className='border rounded p-4 bg-white hover:shadow-xl transition-all ease-in-out ml-5 mr-5'>
        <div className='flex items-center justify-between'>
        <div>
            <h6 className='text-sm font-medium'>{title}</h6>
            <span className='text-xs text-slate-500'>{moment(date).format("DD MMM YYYY")}</span>
        </div>

            <MdOutlinePushPin
            className={`icon-btn ${isPinned ? 'text-primary' : 'text-slate-300'}`}
            onClick={onPinNote} />
        </div>

        <p className=''>{content?.slice(0,60)}</p>

        <div className='flex items-center justify-between mt-2'>
            <div className='text-xs text-slate-500'>
            {tags}         
            </div>

            <div className='flex items-center gap-2'>
            <MdCreate 
            onClick={onEdit} 
                className='icon-btn hover:text-green-600'
            />
            <MdDelete 
            onClick={onDelete}
                className='icon-btn hover:text-red-600'
            />
            </div>
        </div>
    </div>
  )
}

export default NoteCard