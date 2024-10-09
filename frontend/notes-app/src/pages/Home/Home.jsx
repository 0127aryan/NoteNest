import React from 'react'
import { MdAdd } from 'react-icons/md';
import NoteCard from '../../components/Cards/NoteCard';
import Navbar from '../../components/Navbar/Navbar';
import AddEditNotes from './AddEditNotes';
import { useEffect, useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import moment from 'moment';
import Toast from '../../components/ToastMessage/Toast';
import EmptyCard from '../../components/EmptyCard/EmptyCard';
import addnote from '../../assets/addnote.svg'
import nodata from '../../assets/nodata.svg'
const Home = () => {

  const [openAddEditModal, setOpenAddEditModal] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToast, setShowToast] = useState({
    isShown: false,
    message: "",
    type: "success",
  })

  const [allNotes, setAllNotes] = useState([])
  const [userInfo, setUserInfo] = useState(null);
  const [isSearch, setIsSearch] = useState(false);


  const navigate = useNavigate();

  const handleEdit = (noteDetails) => {
    setOpenAddEditModal({isShown: true, data: noteDetails, type: 'edit'})
  }

  const showToastMessage = (message, type) => {
    setShowToast({
      isShown: true,
      message,
      type
    })
  }

  const handleCloseToast = () => {
    setShowToast({
      isShown: false,
      message: "",
    })
  }

  const getUserInfo = async () => {
    try{
      const response = await axiosInstance.get("/getuser");
      if(response.data && response.data.user){
      setUserInfo(response.data.user);
    }
    } catch(error){
      if(error.response.status === 401){
        localStorage.clear();
        navigate('/login')
      }
    }
  };

  //Get all notes 

  const getAllNotes = async () => {
    try{
      const response = await axiosInstance.get("/allnotes")

      if(response.data && response.data.notes){
        setAllNotes(response.data.notes);
      }
    }
    catch(error){
      console.log("Error in fetching notes", error);
    }
  }

  const deleteNote = async (data) => {
    try{
      const noteId = data._id
      const response = await axiosInstance.delete('/deletenote/'+noteId);

      if(response.data && !response.data.error){
          showToastMessage("Note Deleted Successfully")
          getAllNotes()
      }
  }
  catch(error){
      if (
          error.response &&
          error.response.data &&
          error.response.data.message
      ) {
          console.log("An unexpected error occoured, Please try again later!")
      }
  }
  }

  const onSearchNote = async (query) => {
    try{
      const response = await axiosInstance.get('/searchnotes', {
        params: { query },
      })
      if(response.data && response.data.notes){
        setIsSearch(true)
        setAllNotes(response.data.notes)
      }
    } catch(error) {
      console.log(error)
    }
  }

  const updateIsPinned = async (noteData) => {
    const noteId = noteData._id
        try{
            const response = await axiosInstance.put('/pinnednotes/'+noteId, {
                isPinned: !noteData.isPinned
            });

            if(response.data && response.data.note){
                showToastMessage("Note Updated Successfully")
                getAllNotes()
            }
        }
        catch(error){
           console.log(error)
        }
  }

  const handleClearSearch = () => {
    setIsSearch(false)
    getAllNotes()
  }

  useEffect(() => {
    getAllNotes();
    getUserInfo();
    return () => {
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <Navbar 
        userInfo={userInfo} 
        onSearchNote={onSearchNote}
        handleClearSearch={handleClearSearch}  />

      <div className='container mx-auto'>

      {allNotes.length > 0 ? (
        <div className='grid grid-cols-3 gap-4 mt-8'>     

        {allNotes.map((item, index) => (
          <NoteCard 
          key={item._id}
        title={item.title}
        date={moment(item.createdOn).format('DD MMM YYYY')}
        content={item.content}
        tags={item.tags}
        isPinned={item.isPinned}
        onEdit={() => handleEdit(item)} 
        onDelete={() =>deleteNote(item)}
        onPinNote={() =>updateIsPinned(item)} />
        ))}
        </div>
        ) : (
          <EmptyCard imgSrc={isSearch ? nodata : addnote} message={isSearch ? `Oops! No Notes found matching your search.` : `Start Creating Your First note! Click the 'Add' to drop down your thoughts, ideas and reminders on NoteNest. Let's Get Start`} />
        )}
      </div>

      <button 
      className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10'
      onClick={() => {
        setOpenAddEditModal({isShown: true, type:'add', data: null})
      }}>
        <MdAdd
        className='text-[32px] text-white' />
      </button>

      <Modal
        isOpen={openAddEditModal.isShown}
        onRequestClose={() => {}}
          style={{
            overlay: {
              background: "rgba(0,0,0,0.2)",
            },
          }}
          contentLabel=''
          className="w-[50%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
        >

      <AddEditNotes
      type={openAddEditModal.type}
      noteData={openAddEditModal.data}
      onClose={() => {
        setOpenAddEditModal({isShown: false, type:'add', data: null})
      }}
      getAllNotes={getAllNotes}
      showToastMessage={showToastMessage} />

      </Modal>
      <Toast 
      isShown={showToast.isShown}
      message={showToast.message}
      type={showToast.type}
      onClose={handleCloseToast} />
    </>
  )
}

export default Home;