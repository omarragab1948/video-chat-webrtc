// import  { useEffect, useState, useRef } from "react";
// import Peer from "peerjs";
// const App = () => {
//   const [peerId, setPeerId] = useState("");
//   const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
//   const remoteVideoRef = useRef(null);
//   const currentUserVideoRef = useRef(null);
//   const peerInstance = useRef(null);

//   useEffect(() => {
//     const peer = new Peer();

//     peer.on("open", (id) => {
//       setPeerId(id);
//     });

//     peer.on("call", (call) => {
//       var getUserMedia =
//         navigator.getUserMedia ||
//         navigator.webkitGetUserMedia ||
//         navigator.mozGetUserMedia;

//       getUserMedia({ video: true, audio: true }, (mediaStream) => {
//         currentUserVideoRef.current.srcObject = mediaStream;
//         currentUserVideoRef.current.play();
//         call.answer(mediaStream);
//         call.on("stream", function (remoteStream) {
//           remoteVideoRef.current.srcObject = remoteStream;
//           remoteVideoRef.current.play();
//         });
//       });
//     });

//     peerInstance.current = peer;
//   }, []);

//   const call = (remotePeerId) => {
//     var getUserMedia =
//       navigator.getUserMedia ||
//       navigator.webkitGetUserMedia ||
//       navigator.mozGetUserMedia;

//     getUserMedia({ video: true, audio: true }, (mediaStream) => {
//       currentUserVideoRef.current.srcObject = mediaStream;
//       currentUserVideoRef.current.play();

//       const call = peerInstance.current.call(remotePeerId, mediaStream);

//       call.on("stream", (remoteStream) => {
//         remoteVideoRef.current.srcObject = remoteStream;
//         remoteVideoRef.current.play();
//       });
//     });
//   };
//   return (
//     <div className="App">
//       <h1>Current user id is {peerId}</h1>
//       <input
//         type="text"
//         value={remotePeerIdValue}
//         onChange={(e) => setRemotePeerIdValue(e.target.value)}
//       />
//       <button onClick={() => call(remotePeerIdValue)}>Call</button>
//       <div>
//         <video ref={currentUserVideoRef} />
//       </div>
//       <div>
//         <video ref={remoteVideoRef} />
//       </div>
//     </div>
//   );
// };

// export default App;
import { useEffect, useState, useRef } from "react";
import Peer from "peerjs";

const App = () => {
  const [peerId, setPeerId] = useState("");
  const [remotePeerIdValue, setRemotePeerIdValue] = useState("");
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [callEnded, setCallEnded] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null); // Track incoming call
  const [callAccepted, setCallAccepted] = useState(false);

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

  const toggleMute = () => {
    // Toggle the mute/unmute state and update the audio track accordingly
    const audioTrack =
      currentUserVideoRef.current.srcObject?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const stopCall = () => {
    // Close the peer connection
    if (peerInstance.current) {
      peerInstance.current.destroy();
    }

    // Stop the user's video stream
    const userMediaStream = currentUserVideoRef.current.srcObject;
    userMediaStream?.getTracks().forEach((track) => track.stop());

    // Stop the remote video stream
    const remoteMediaStream = remoteVideoRef.current.srcObject;
    remoteMediaStream?.getTracks().forEach((track) => track.stop());

    // Update the UI to indicate that the call has ended
    setCallEnded(true);
    setCallAccepted(false); // Reset call acceptance state
  };

  const call = (remotePeerId) => {
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
          setIsCalling(true); // Update call status
        });
      });
    } catch (error) {
      setErrorMessage("An error occurred during the call: " + error.message);
    }
  };

  const acceptCall = () => {
    setCallAccepted(true);

    // Answer the call and send your own media stream
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

    // Clear the incoming call state
    setIncomingCall(null);
    setStatusMessage("Call accepted");
  };

  const rejectCall = () => {
    // Reject the call and inform the caller
    incomingCall.close();
    setIncomingCall(null);
    setStatusMessage("Call rejected");
  };
  console.log(remoteVideoRef);
  return (
    <div className="App">
      <h1>Current user id is {peerId}</h1>
      <input
        type="text"
        value={remotePeerIdValue}
        onChange={(e) => setRemotePeerIdValue(e.target.value)}
      />
      {!incomingCall ? (
        // Call button
        <button onClick={() => call(remotePeerIdValue)}>Call</button>
      ) : (
        // Incoming call UI
        <div>
          <p>{statusMessage}</p>
          {!callAccepted && (
            <>
              <button onClick={acceptCall}>Accept</button>
              <button onClick={rejectCall}>Reject</button>
            </>
          )}
        </div>
      )}

      {/* Mute/Unmute and Stop Call Controls */}
      <div>
        <button onClick={toggleMute}>{isMuted ? "Unmute" : "Mute"}</button>
        <button onClick={stopCall}>End Call</button>
      </div>

      {/* Status Message */}
      <h2>Status: {statusMessage}</h2>

      {/* Error Message */}
      {errorMessage && <p className="error">{errorMessage}</p>}

      {/* Video Elements */}
      {!callEnded && (
        <>
          <div>
            <video ref={currentUserVideoRef} />
          </div>
          <div>
            <video ref={remoteVideoRef} />
          </div>
        </>
      )}
    </div>
  );
};

export default App;
