import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  styled,
  TableSortLabel,
} from "@mui/material";

// Styled components
const EditButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  margin: theme.spacing(0.5),
  backgroundColor: "#e57373",
  color: "#b71c1c",
  "&:hover": {
    backgroundColor: "#b71c1c",
    color: "#fff",
  },
}));

const DeleteButton = styled(Button)(({ theme }) => ({
  minWidth: 0,
  margin: theme.spacing(0.5),
  backgroundColor: "#64b5f6",
  color: "#0d47a1",
  "&:hover": {
    backgroundColor: "#0d47a1",
    color: "#fff",
  },
}));

const TableContainerStyled = styled(TableContainer)(({ theme }) => ({
  marginTop: theme.spacing(3),
  maxHeight: 400,
  overflowY: "auto",
  border: "1px solid #ddd",
}));

const TableHeadRowStyled = styled(TableRow)(({ theme }) => ({
  backgroundColor: "#4a00e0",
  "& th": {
    color: "#fff",
    fontWeight: "bold",
    position: "sticky",
    top: 0,
    backgroundColor: "#4a00e0",
    zIndex: 1,
  },
}));

const TableRowStyled = styled(TableRow)(({ theme }) => ({
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
  },
}));

const NoDataMessage = styled(Typography)(({ theme }) => ({
  textAlign: "center",
  fontSize: "1.2rem",
  color: theme.palette.text.secondary,
}));

const headCells = [
  { id: "name", label: "Event Name" },
  { id: "date", label: "Event Date" },
  { id: "location", label: "Location" },
  { id: "eventType", label: "Event Type" },
];
const normalizeEvents = (events) =>
  events.map((event) => ({
    ...event,
    name: event.name || event.title || "",
  }));

function descendingComparator(a, b, orderBy) {
  const aValue = a[orderBy]?.toString().toLowerCase() || "";
  const bValue = b[orderBy]?.toString().toLowerCase() || "";

  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}


function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const result = comparator(a[0], b[0]);
    return result !== 0 ? result : a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

const EventTable = ({ events, handleEdit, handleDelete }) => {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("date");

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  if (!events || events.length === 0) {
    return <NoDataMessage>No events available.</NoDataMessage>;
  }

  const normalizedEvents = normalizeEvents(events);
  const sortedEvents = stableSort(normalizedEvents, getComparator(order, orderBy));

  return (
    <TableContainerStyled component={Paper}>
      <Table stickyHeader>
        <TableHead>
          <TableHeadRowStyled>
            {headCells.map((headCell) => (
              <TableCell
                key={headCell.id}
                sortDirection={orderBy === headCell.id ? order : false}
              >
                <TableSortLabel
                  active={orderBy === headCell.id}
                  direction={orderBy === headCell.id ? order : "asc"}
                  onClick={() => handleRequestSort(headCell.id)}
                  sx={{ color: "#fff", "&.Mui-active": { color: "#fff" } }}
                >
                  {headCell.label}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell>Actions</TableCell>
          </TableHeadRowStyled>
        </TableHead>
        <TableBody>
          {sortedEvents.map((event) => (
            <TableRowStyled hover key={event._id}>
              <TableCell>{event.name || event.title || "No Name"}</TableCell>
              <TableCell>
                {event.date ? new Date(event.date).toLocaleDateString() : "No Date"}
              </TableCell>
              <TableCell>{event.location}</TableCell>
              <TableCell>{event.eventType}</TableCell>
              <TableCell>
                <EditButton onClick={() => handleEdit(event, event._id)}>Edit</EditButton>
                <DeleteButton onClick={() => handleDelete(event._id)}>Delete</DeleteButton>
              </TableCell>
            </TableRowStyled>
          ))}
        </TableBody>
      </Table>
    </TableContainerStyled>
  );
};

export default EventTable;