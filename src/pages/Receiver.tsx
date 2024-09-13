import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Video, Mic, MicOff, Camera, CameraOff, Volume2, VolumeX, PhoneOff, Users, Monitor, StopCircle } from 'lucide-react';
import io, { Socket } from 'socket.io-client';

const Receiver: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [status, setStatus] = useState("Waiting for sender...");
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [remoteMuted, setRemoteMuted] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join', { roomId, role: 'receiver' });
    });

    newSocket.on('status', (data) => {
      console.log('Received status:', data);
      if (data.message === "Connected to sender") {
        setStatus("Connected to sender! Setting up connection...");
      }
    });

    newSocket.on('sender-offer', (data) => {
      handleOffer(data.sdp);
    });

    newSocket.on('ice-candidate', (data) => {
      if (peerConnection && data.candidate) {
        peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const handleOffer = async (sdp: RTCSessionDescriptionInit) => {
    if (!peerConnection || !socket) return;

    try {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socket.emit('sdp', { roomId, sdp: answer, role: 'receiver' });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  };

  const initWebRTC = async () => {
    if (peerConnection) {
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      let newStream;
      if (isScreenSharing) {
        newStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      } else {
        const constraints = { audio: micOn, video: cameraOn };
        newStream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      setStream(newStream);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }

      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          { urls: "stun:stun2.l.google.com:19302" },
          { urls: "stun:stun3.l.google.com:19302" },
          { urls: "stun:stun4.l.google.com:19302" },
        ],
      });

      newStream.getTracks().forEach((track) => pc.addTrack(track, newStream));

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && socket) {
          socket.emit('ice-candidate', { roomId, candidate: event.candidate, role: 'receiver' });
        }
      };

      setPeerConnection(pc);
    } catch (error) {
      console.error("Error accessing media devices.", error);
      setIsScreenSharing(false);
    }
  };

  useEffect(() => {
    if (peerConnection) {
      if (stream) {
        const audioTrack = stream.getAudioTracks()[0];
        const videoTrack = stream.getVideoTracks()[0];

        if (audioTrack) {
          audioTrack.enabled = micOn;
        }

        if (videoTrack) {
          videoTrack.enabled = cameraOn;
        }
      }
      initWebRTC();
    }
  }, [micOn, cameraOn, isScreenSharing, peerConnection]);

  useEffect(() => {
    initWebRTC();
  }, [socket]);


  const toggleMic = () => setMicOn((prev) => !prev);
  const toggleCamera = () => setCameraOn((prev) => !prev);

  const toggleRemoteMute = () => {
    setRemoteMuted((prev) => !prev);
    if (remoteVideoRef.current) {
      remoteVideoRef.current.muted = !remoteMuted;
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
        setStream(screenStream);
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream;
        }
        setIsScreenSharing(true);

        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
          initWebRTC();
        };

        if (peerConnection) {
          const senders = peerConnection.getSenders();
          const videoSender = senders.find(sender => sender.track?.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenStream.getVideoTracks()[0]);
          }
        }
      } catch (error) {
        console.error("Error starting screen share:", error);
        setIsScreenSharing(false);
      }
    }
  };

  function endCall() {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
  
    if (socket) {
      socket.close();
      setSocket(null);
    }
  
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  
    setStatus("Call ended");
  
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }

  return (
    <div className="h-screen bg-gray-900 text-gray-100 flex flex-col overflow-hidden">
      <header className="bg-gray-800/50 backdrop-blur-md border-b border-gray-700 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Video className="h-8 w-8 text-cyan-400" />
            <span className="ml-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">LiveLink</span>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-cyan-400">Room ID: {roomId}</p>
            <p className="text-blue-300">Status: {status}</p>
          </div>
        </div>
      </header>

      <main className="flex-grow flex flex-col md:flex-row p-4 space-y-4 md:space-y-0 md:space-x-4 overflow-hidden">
        <div className="flex-grow flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 overflow-hidden">
          <div className="relative flex-grow min-h-0">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              muted={remoteMuted}
              className="w-full h-full bg-gray-800 rounded-lg shadow-lg object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-gray-900/70 px-2 py-1 rounded-md text-sm">
              Remote
            </div>
          </div>
          <div className="relative flex-grow min-h-0">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted={!micOn}
              className="w-full h-full bg-gray-800 rounded-lg shadow-lg object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-gray-900/70 px-2 py-1 rounded-md text-sm">
              You {isScreenSharing && "(Screen)"}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gray-800/50 backdrop-blur-md border-t border-gray-700 p-4 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ${
              micOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {micOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </button>
          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ${
              cameraOn ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {cameraOn ? <Camera className="h-6 w-6" /> : <CameraOff className="h-6 w-6" />}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ${
              isScreenSharing ? 'bg-purple-600 hover:bg-purple-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isScreenSharing ? <StopCircle className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
          </button>
          <button
            onClick={toggleRemoteMute}
            className={`p-3 rounded-full flex items-center justify-center transition-all duration-300 ${
              remoteMuted ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {remoteMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </button>
          <button
            onClick={endCall}
            className="p-3 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-all duration-300"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
          <div className="text-sm text-gray-400 flex items-center">
            <Users className="h-4 w-4 mr-1" /> 1 participant
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Receiver;