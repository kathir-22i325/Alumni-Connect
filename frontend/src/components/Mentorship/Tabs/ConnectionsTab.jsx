import React from "react";


import { Avatar,Box, Typography, Button, Card, CardContent, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";


const ConnectionsTab = ({setSnackbarMessage,setSnackbarOpen}) => {

    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [connections, setConnections] = useState([]);
    // const [snackbarOpen, setSnackbarOpen] = useState(false);
    // const [snackbarMessage, setSnackbarMessage] = useState("");

    useEffect(() => {
        const userEmail = sessionStorage.getItem("email");
        fetchPendingRequests();
        fetchConnections(userEmail);
    }, []);

const fetchConnections = async (email) => {
    try {
        const response = await fetch(`http://localhost:5000/api/users/${email}`);
        if(response.status === 404) {
          console.log("No connections Found");
        }
        const user = await response.json();
        // console.log(data._id);

        const response2 = await fetch(`http://localhost:5000/api/connections/fetch/${user._id}`);
        const conn = await response2.json();
        setConnections(conn.connections);
    } catch (error) {
          console.error("Error fetching connections:", error);
    }};

const handleRequest = async (connectionId, action) => {

    console.log(connectionId);
    try {
      // setLoading(true);
      // const con_res = await fetch(`http://localhost:5000/api/connections/${connectionId}`);
      // if(con_res.status === 404)
      // {
      //   console.log("error fetching connection details");
      // }
      // const connData = await con_res.json();
      // console.log(connData);

      const response = await fetch("http://localhost:5000/api/connections/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ connectionId: connectionId , action }),
      });
  
      const data = await response.json();
      setSnackbarMessage(data.message);
      setSnackbarOpen(true);
      
      if (action === "accept") {
        fetchConnections(); // Refresh the connections list
      }
      fetchPendingRequests(); // Refresh pending requests

      const emailReq = await fetch("http://localhost:5000/api/mail/responseEmail",{
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ connectionId : connectionId , msg: action }),
      });

      const data2 = emailReq.json();
      console.log(data2);

    } catch (error) {
      console.error("Error responding to request:", error);
    }
  };

  const fetchPendingRequests = async () => {
    console.log("Fetching pending requests...");
    const userEmail = sessionStorage.getItem("email");
    // console.log(userId);

    try {
      setLoading(true);
      const user_res = await fetch(`http://localhost:5000/api/users/${userEmail}`);
      if(user_res.status === 404)
      {
        console.log("error fetching user details");
      }
      const userData = await user_res.json();
      const userId = userData._id.trim();

      if (!userData._id) {
        console.log("User ID not found");
        return;
      }

      console.log(userData.email+" "+userData._id);
      const response = await fetch(`http://localhost:5000/api/connections/pending/${userId}`);
      if(response.status === 404) {
        console.log("No pending connections Found");
      }
      const data = await response.json();
      setPendingRequests(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const initiateChat = (connectionId) => {
    navigate(`/mentorship/chat/${sessionStorage.getItem("id")}/${connectionId}`); // Redirect to chat page
  };



    return (
        <Box sx={{pb:10}}>
            {loading ? (
                <CircularProgress />
            ) : (
            <>
          
            {/* 🔹 Pending Requests (For Mentors) */}
            {sessionStorage.getItem("role") === "mentor" && (
                <>
                    <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
                        New Connection Requests
                    </Typography>
                    {pendingRequests?.length === 0 ? (
                        <Typography sx={{ color: "gray", fontStyle: "italic", textAlign: "center" }}>
                            No pending requests.
                        </Typography>
                    ) : (
                        pendingRequests.map((req) => (
                            <Card key={req._id} sx={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "space-between",
                                mb: 2, 
                                p: 2, 
                                borderRadius: 2,
                                boxShadow: 3
                            }}>
                                <Box sx={{ display: "flex", alignItems: "center" }}>
                                    <Avatar sx={{ bgcolor: "#8e2de2", mr: 2 }}>
                                        {req.senderName.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6">{req.senderName}</Typography>
                                        <Typography variant="body2" sx={{ color: "gray" }}>
                                            {req.message || "No message provided."}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box>
                                    <Button
                                        sx={{ mr: 1 }}
                                        variant="contained"
                                        color="success"
                                        onClick={() => handleRequest(req._id, "accept")}
                                    >
                                        Accept
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleRequest(req._id, "reject")}
                                    >
                                        Reject
                                    </Button>
                                </Box>
                            </Card>
                        ))
                    )}
                </>
            )}

            {/* 🔹 Confirmed Connections (For both Mentors & Mentees) */}
            <Typography variant="h5" sx={{ mt: 3, mb: 2, fontWeight: "bold" }}>
              Your Connections
            </Typography>

            {connections?.length === 0 ? (
              <Typography sx={{ color: "gray", fontStyle: "italic", textAlign: "center" }}>
                  No connections yet.
              </Typography>
            ) : (
              connections.map((conn) => (
                <Card 
                    key={conn._id} 
                    sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between",
                          mb: 2, 
                          p: 2, 
                          borderRadius: 2,
                          boxShadow: 3,
                    }}
                >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar 
                        src={conn.photo}
                        sx={{ bgcolor: "#8e2de2", mr: 2 }}
                    />
                  <Box>
                      <Typography variant="h6">{conn.firstName} {conn.lastName}</Typography>
                      <Typography variant="body2" sx={{ color: "gray" }}>
                          Role: {conn.role}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "gray" }}>
                          Meeting Method: {conn.meetingMethod}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "gray" }}>
                          Skills: {conn.skills.join(", ")}
                      </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button 
                      variant="contained" 
                      color="primary"
                      sx={{ textTransform: "none", flex: 1 }}  // Ensures equal width
                      onClick={() => initiateChat(conn._id)}
                  >
                      Chat
                  </Button>
                  <Button
                      variant="contained" 
                      color="error"
                      sx={{ textTransform: "none", flex: 1 }}  // Same width as Chat button
                  > 
                      Close Connection
                  </Button>
                </Box>
              </Card>
              ))
             )}
            </>
            )}
        </Box>
    );
};

export default ConnectionsTab;