import { FC, useState } from "react";
import { TransactionModel } from "../models/transactionModel";
import React from "react";
import { Box, Collapse, Table, TableBody, TableCell, TableHead, TableRow, Typography, IconButton } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ModeEditOutlineTwoToneIcon from '@mui/icons-material/ModeEditOutlineTwoTone';

const RowExpanded: FC<{
    data: TransactionModel,
    onAction: (data: TransactionModel) => void
}> = ({ ...props }) => {
    const [open, setOpen] = useState<boolean>(false)
    return (
        <React.Fragment>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                {/* <TableCell component="th" scope="row">{props.data.id}</TableCell> */}
                <TableCell align="left">{props.data.itemName}</TableCell>
                <TableCell align="left">{props.data.status === 'PROCESS' ? "RENTED" : props.data.status}</TableCell>
                <TableCell align="left">
                    <IconButton aria-label="update" onClick={() => {
                        props.onAction(props.data)
                    }}>
                        <ModeEditOutlineTwoToneIcon />
                    </IconButton>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div">
                                Detail
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Nama</TableCell>
                                        <TableCell>NIK</TableCell>
                                        <TableCell >Rfid</TableCell>
                                        <TableCell align="right">Phone Number</TableCell>
                                        <TableCell align="right">Order Date</TableCell>
                                        <TableCell align="right">Return Date</TableCell>
                                        <TableCell align="right">Price /Week</TableCell>
                                        <TableCell align="right">Price /Month</TableCell>
                                        <TableCell align="right">Address</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    <TableRow key={props.data.id}>
                                        <TableCell component="th" scope="row">
                                            {props.data.name}
                                        </TableCell>
                                        <TableCell>{props.data.nik}</TableCell>
                                        <TableCell>{props.data.id}</TableCell>
                                        <TableCell align="right">{props.data.phoneNumber}</TableCell>
                                        <TableCell align="right">{props.data.orderDate}</TableCell>
                                        <TableCell align="right">{props.data.returnDate}</TableCell>
                                        <TableCell align="right">{props.data.pricePerWeek}</TableCell>
                                        <TableCell align="right">{props.data.pricePerMonth}</TableCell>
                                        <TableCell align="right">{props.data.address}</TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    )
}

export default RowExpanded
