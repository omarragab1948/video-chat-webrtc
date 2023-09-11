import { useEffect, useState, useRef } from "react";
import Peer from "peerjs";
import { BiMicrophone, BiMicrophoneOff, BiPhone, BiCheck, BiX } from 'react-icons/bi';
import { useReactMediaRecorder } from "react-media-recorder";
import axios from 'axios';
import { ImPhoneHangUp } from 'react-icons/im';

const MentorProfile = () => {
  // State and Ref declarations...
  const [peerId, setPeerId] = useState(""); // Store the user's Peer ID
  const [remotePeerIdValue, setRemotePeerIdValue] = useState(""); // Store the remote Peer ID input value
  const remoteVideoRef = useRef(null); // Reference for displaying remote video
  const currentUserVideoRef = useRef(null); // Reference for displaying user's video
  const peerInstance = useRef(null); // Reference for the Peer.js instance
  const [isMuted, setIsMuted] = useState(false); // Track whether the user is muted
  const [isCalling, setIsCalling] = useState(false); // Track whether a call is in progress
  const [statusMessage, setStatusMessage] = useState(""); // Display status messages
  const [errorMessage, setErrorMessage] = useState(""); // Display error messages
  const [callEnded, setCallEnded] = useState(false); // Track call ending
  const [incomingCall, setIncomingCall] = useState(null); // Track incoming call
  const [callAccepted, setCallAccepted] = useState(false); // Track call acceptance

  // Media recording hooks for current and remote videos
  const {
    startRecording: startCurrentRecording,
    stopRecording: stopCurrentRecording,
    mediaBlob: currentMediaBlob,
  } = useReactMediaRecorder({ video: true });
  
  const {
    startRecording: startRemoteRecording,
    stopRecording: stopRemoteRecording,
    mediaBlob: remoteMediaBlob,
  } = useReactMediaRecorder({ video: true });

  // Function to send recorded videos to the backend
  const sendVideosToBackend = () => {
    if (currentMediaBlob && remoteMediaBlob) {
      const formData = new FormData();
      formData.append("currentVideo", currentMediaBlob, "current-video.webm");
      formData.append("remoteVideo", remoteMediaBlob, "remote-video.webm");

      axios
        .post("http://localhost:3000/upload-video", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((response) => {
          console.log("Videos uploaded successfully:", response.data);
        })
        .catch((error) => {
          console.error("Error uploading videos:", error);
        });
    }
  };

  // Initialize the Peer connection when the component mounts
  useEffect(() => {
    const peer = new Peer();

    peer.on("open", (id) => {
      setPeerId(id);
    });

    peer.on("call", (call) => {
      // Handle incoming call
      setIncomingCall(call);
      setStatusMessage("Incoming call...");
    });

    peerInstance.current = peer;
  }, []);

  // Toggle mute/unmute for audio
  const toggleMute = () => {
    const audioTrack =
      currentUserVideoRef.current.srcObject?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Stop the call and send recorded videos to the backend
  const stopCall = () => {
    stopCurrentRecording();
    stopRemoteRecording();
    sendVideosToBackend();
    if (peerInstance.current) {
      peerInstance.current.destroy();
    }
    const userMediaStream = currentUserVideoRef.current.srcObject;
    userMediaStream?.getTracks().forEach((track) => track.stop());
    const remoteMediaStream = remoteVideoRef.current.srcObject;
    remoteMediaStream?.getTracks().forEach((track) => track.stop());
    setCallEnded(true);
    setCallAccepted(false);
  };

  // Initiate a call
  const call = (remotePeerId) => {
    startCurrentRecording();
    startRemoteRecording();
    setCallEnded(false);

    try {
      var getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: true }, (mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();

        const call = peerInstance.current.call(remotePeerId, mediaStream);

        call.on("stream", (remoteStream) => {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
          setIsCalling(true);
        });
      });
    } catch (error) {
      setErrorMessage("An error occurred during the call: " + error.message);
    }
  };

  // Accept an incoming call
  const acceptCall = () => {
    setCallAccepted(true);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
        incomingCall.answer(mediaStream);
        incomingCall.on("stream", function (remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play();
        });
      });

    setIncomingCall(null);
    setStatusMessage("Call accepted");
  };

  // Reject an incoming call
  const rejectCall = () => {
    incomingCall.close();
    setIncomingCall(null);
    setStatusMessage("Call rejected");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Current user id is {peerId}</h1>
      <input
        type="text"
        value={remotePeerIdValue}
        onChange={(e) => setRemotePeerIdValue(e.target.value)}
        className="border rounded-md px-2 py-1 mb-4"
      />
      {!incomingCall ? (
        // Call button
        <button
          onClick={() => call(remotePeerIdValue)}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3"
        >
          <BiPhone size={24} />
        </button>
      ) : (
        // Incoming call UI
        <div className="text-xl mb-4">
          <p>{statusMessage}</p>
          {!callAccepted && (
            <>
              <button
                onClick={acceptCall}
                className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 mr-4"
              >
                <BiCheck size={24} />
              </button>
              <button
                onClick={rejectCall}
                className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3"
              >
                <BiX size={24} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Mute/Unmute and Stop Call Controls */}
      <div className="text-2xl mb-4">
        <button
          onClick={toggleMute}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 mr-4"
        >
          {isMuted ? <BiMicrophoneOff size={24} /> : <BiMicrophone size={24} />}
        </button>
        <button
          onClick={stopCall}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-3"
        >
          <ImPhoneHangUp size={24} />
        </button>
      </div>

      {/* Status Message */}
      <h2 className="text-xl mb-4">Status: {statusMessage}</h2>

      {/* Error Message */}
      {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

      {/* Video Elements */}
      {!callEnded && (
        <div className="grid grid-cols-2 gap-4">
          <div className="w-1/2">
            <video ref={currentUserVideoRef} className="w-full rounded-lg shadow-lg" />
          </div>
          <div className="w-1/2">
            <video ref={remoteVideoRef} className="w-full rounded-lg shadow-lg" />
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorProfile;
