import React, { useState, useEffect } from "react";
import {
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box
} from "@mui/material";
import { styled } from "@mui/material/styles";
import EventForm from "./EventForm";
import EventTable from "./EventTable";
import * as eventService from "../services/eventService";
import AdminNavBar from "./AdminNavBar";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// Create a custom styled button with enhanced UI
const CustomButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1),
  borderRadius: "8px",
  fontWeight: "bold",
  textTransform: "capitalize",
  fontSize: "1rem",
  padding: theme.spacing(1, 2),
  boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
  transition: "background-color 0.3s, transform 0.3s",
  "&:hover": {
    transform: "scale(1.03)",
    boxShadow: "0px 6px 10px rgba(0,0,0,0.15)",
  },
}));

const AdminPage = () => {
  const [events, setEvents] = useState([]);
  const [openPopup, setOpenPopup] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [recordForEdit, setRecordForEdit] = useState(null);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const data = await eventService.getAllEvents();
    setEvents(data);
  };

  const addOrEditEvent = async (eventFormData) => {
    const id = eventFormData.get("_id");
    if (id) {
      await eventService.updateEvent(eventFormData, id);
    } else {
      await eventService.insertEvent(eventFormData);
    }

    setOpenPopup(false);
    setRecordForEdit(null);
    fetchEvents();
  };

  const handleDelete = async (eventId) => {
    await eventService.deleteEvent(eventId);
    setEvents(events.filter((event) => event._id !== eventId));
  };

  const handleEdit = (event, id) => {
    const eventToEdit = { ...event, _id: id };
    setRecordForEdit(eventToEdit);
    setCurrentEvent(eventToEdit);
    setOpenPopup(true);
  };

  const exportFilteredEvents = () => {
    if (!startDate || !endDate) return;

    const filtered = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= new Date(startDate) && eventDate <= new Date(endDate);
    });

    const data = filtered.map(event => ({
      Title: event.title,
      Description: event.description,
      EventType: event.eventType,
      Date: event.date,
      Location: event.location,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "FilteredEvents");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const file = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(file, `Events_${startDate}_to_${endDate}.xlsx`);
  };

  return (
    <>
      <AdminNavBar />
      <Paper sx={{ p: 3 }} elevation={0}>
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(to right, #4a00e0, #8e2de2)",
            padding: "16px",
            borderRadius: "8px",
            textAlign: "center",
            mb: 3,
          }}
        >
          <Typography variant="h3" fontWeight="bold" color="white">
            Admin - Manage Alumni Events
          </Typography>
        </Box>

        {/* Add Event Button */}
        <Box sx={{ textAlign: "center" }}>
          <CustomButton
            color="primary"
            onClick={() => {
              setOpenPopup(true);
              setCurrentEvent(null);
            }}
            sx={{
              padding: "12px 24px",
              fontSize: "1.2rem",
              borderRadius: "8px",
            }}
          >
            Add Event
          </CustomButton>
        </Box>

        {/* Download Button */}
        <Box sx={{ textAlign: "center" }}>
          <CustomButton
            color="secondary"
            onClick={() => setDateDialogOpen(true)}
            sx={{
              padding: "12px 24px",
              fontSize: "1.2rem",
              borderRadius: "8px",
            }}
          >
            Download Events
          </CustomButton>
        </Box>

        {/* Event Table */}
        <EventTable
          events={events}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />

        {/* Add/Edit Event Dialog */}
        <Dialog open={openPopup} onClose={() => setOpenPopup(false)} maxWidth="sm" fullWidth>
          <DialogTitle>{currentEvent ? "Edit Event" : "Add Event"}</DialogTitle>
          <DialogContent>
            <EventForm eventForEdit={recordForEdit} addOrEdit={addOrEditEvent} />
          </DialogContent>
        </Dialog>
      </Paper>

      {/* Date Range Dialog */}
      <Dialog open={dateDialogOpen} onClose={() => setDateDialogOpen(false)}>
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} p={1}>
            <label>
              Start Date:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              End Date:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                exportFilteredEvents();
                setDateDialogOpen(false);
              }}
            >
              Download
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminPage;
