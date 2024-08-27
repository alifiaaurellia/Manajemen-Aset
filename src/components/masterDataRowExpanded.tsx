import { FC, useState } from "react";
import { MasterDataDetailModel } from "../models/EnrolledModel";
import React from "react";
import { Box, Collapse, IconButton, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ModeEditOutlineTwoToneIcon from '@mui/icons-material/ModeEditOutlineTwoTone';
import { DataDetailForTableModel } from "../pages/enrolled";
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';

interface MasterDataRowExpandedProps {
    data: DataDetailForTableModel
    onUpdate: (data: MasterDataDetailModel) => void
    onDelete: (data: MasterDataDetailModel) => void
    index: number
}
const MasterDataRowExpanded: FC<MasterDataRowExpandedProps> = ({ ...props }) => {
    const [open, setOpen] = useState<boolean>(false)
    return <React.Fragment>
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
            <TableCell align="left">{props.data.name}</TableCell>
            <TableCell align="left">{props.data.stock}</TableCell>
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
                                    <TableCell align="left">Enrolled Key</TableCell>
                                    <TableCell align="left">Price /Mounth</TableCell>
                                    <TableCell align="left">Price /Week</TableCell>
                                    <TableCell align="left">Total Peminjam</TableCell>
                                    {
                                        localStorage.getItem('access_role') === 'operator' && <TableCell align="right">Aksi</TableCell>
                                    }
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    props.data.detail.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell align="left">{item.enrolledKey}</TableCell>
                                            <TableCell align="left">{item.pricePerMonth}</TableCell>
                                            <TableCell align="left">{Number(String(item?.pricePerWeek || '0').replace(/,/g, '')).toLocaleString()}</TableCell>
                                            <TableCell align="left">{Number(String(item?.pricePerMonth || '0').replace(/,/g, '')).toLocaleString()}</TableCell>
                                            {
                                                localStorage.getItem('access_role') === 'operator' &&
                                                <TableCell align="center">
                                                    <IconButton aria-label="update" onClick={() => { props.onUpdate(item) }} disabled={
                                                        localStorage.getItem('access_role') !== 'operator'
                                                    }>
                                                        <ModeEditOutlineTwoToneIcon />
                                                    </IconButton>
                                                    <IconButton aria-label="delete" onClick={() => { props.onDelete(item) }} disabled={
                                                        localStorage.getItem('access_role') !== 'operator'
                                                    }>
                                                        <DeleteTwoToneIcon />
                                                    </IconButton>
                                                </TableCell>
                                            }

                                        </TableRow>
                                    ))
                                }

                            </TableBody>
                        </Table>
                    </Box>
                </Collapse>
            </TableCell>
        </TableRow>
    </React.Fragment >
}

export default MasterDataRowExpanded