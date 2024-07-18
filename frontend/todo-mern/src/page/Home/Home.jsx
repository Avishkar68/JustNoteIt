import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import NoteCard from "../../components/cards/NoteCard";
import { MdAdd } from "react-icons/md";
import AddEditNotes from "./AddEditNotes";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosinstance";
import moment from "moment";
import Toast from "../../components/ToastMessage/Toast";

Modal.setAppElement("#root");

const Home = () => {
  const [openAddEditModel, setOpenAddEditModel] = useState({
    isShown: false,
    type: "add",
    data: null,
  });

  const [showToastMsg, setShowToastMsg] = useState({
    isShown: false,
    message: "",
    type: "add",
  });

  const [userInfo, setUserInfo] = useState(null);
  const [notes, setNotes] = useState(null);
  const navigate = useNavigate();

  const [isSearch , setIsSearch] = useState(false)

  const handleEdit = (noteDetails) => {
    setOpenAddEditModel({ isShown: true, data: noteDetails, type: "edit" });
  };

  const showToastMessage = (message, type) => {
    setShowToastMsg({
      isShown: true,
      message,
      type,
    });
  };

  const handleCloseToast = () => {
    setShowToastMsg({
      isShown: false,
      message: "",
    });
  };

  const handleClearSearch = () => {
    setIsSearch(false)
    getAllNotes()
  }

  // Get user info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get("/get-user");
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("Error fetching user info:", error.message);
      }
    }
  };

  // Get All Notes
  const getAllNotes = async () => {
    try {
      const response = await axiosInstance.get("/get-all-notes");
      if (response.data && response.data.notes) {
        setNotes(response.data.notes);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        console.error("Error fetching notes:", error.message);
      }
    }
  };

  //delete note
  const deleteNote = async (noteData) => {
    const noteId = noteData._id;
    try {
      const response = await axiosInstance.delete("/delete-note/" + noteId);
      if (response.data && !response.data.error) {
        showToastMessage("Note Deleted Successfully", "delete");
        getAllNotes();
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        console.error("Unexpected error occured");
      }
    }
  };

  //search note
  const onSearchNote = async (query ) => {
    try {
      const response = await axiosInstance.get("/search-notes",{
        params: {query}
      })
      if(response.data && response.data.notes){
        setIsSearch(true)
        setNotes(response.data.notes)
      }
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getUserInfo();
    getAllNotes();
  }, []);

  const updateIsPinned = async (noteData) => {
    const noteId = noteId._id

    try {
      const response = await axiosInstance.put("/update-note-isPinned/"+noteId ,{
        isPinned: !noteData.isPinned
      })
      if(response.data && response.data.note){
        showToastMessage("Note Updated successfully")
        getAllNotes()
      }
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <Navbar userInfo={userInfo} onSearchNote={onSearchNote} handleClearSearch={handleClearSearch}/>
      <div className="container mx-auto">
        {notes && notes.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 m-8">
            {notes.map((note) => (
              <NoteCard
                key={note._id}
                title={note.title}
                date={moment(note.createdOn).format("Do MMM YYYY")} // Use the actual date property from note
                content={note.content} // Use the actual content property from note
                tags={note.tags} // Assuming tags is an array
                isPinned={note.isPinned} // Use the actual isPinned property from note
                onEdit={() => handleEdit(note)}
                onDelete={() => deleteNote(note)}
                onPinNote={() => updateIsPinned(note)}
              />
            ))}
          </div>
        ) : (
          <>
            {isSearch ? (<><p>Not found</p></>) : (<>
            <p>No notes available</p>
            <button
              onClick={() => {
                setOpenAddEditModel({ isShown: true, type: "add", data: null });
              }}
            >Add notes</button></>)}
          </>
        )}
      </div>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600 absolute right-10 bottom-10"
        onClick={() => {
          setOpenAddEditModel({ isShown: true, type: "add", data: null });
        }}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>
      <Modal
        isOpen={openAddEditModel.isShown}
        onRequestClose={() => {
          setOpenAddEditModel({ isShown: false, type: "add", data: null });
        }}
        style={{
          overlay: {
            backgroundColor: "rgba(0,0,0,0.2)",
          },
        }}
        contentLabel=""
        className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5"
      >
        <AddEditNotes
          type={openAddEditModel.type}
          noteData={openAddEditModel.data}
          onClose={() => {
            setOpenAddEditModel({ isShown: false, type: "add", data: null });
          }}
          getAllNotes={getAllNotes}
          showToastMessage={showToastMessage}
        />
      </Modal>
      <Toast
        isShown={showToastMsg.isShown}
        message={showToastMsg.message}
        type={showToastMsg.type}
        onClose={handleCloseToast}
      />
    </>
  );
};

export default Home;
