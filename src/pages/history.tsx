import { FC, useContext, useEffect, useState } from "react";
import { HistoryModel } from "../models/historyModel";
import { Helmet } from "react-helmet-async";
import { Backdrop, Box, Card, Chip, CircularProgress, Container, Unstable_Grid2 as Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import QueryField from "../components/query-field";
import { COLLHISTORY } from "../utils/GlobalVariable";
import { onValue, ref } from "firebase/database";
import { DBProvider } from "../App";

const HistoryPage: FC = () => {

    const { db } = useContext(DBProvider)
    const [dataTable, setDataTable] = useState<HistoryModel[]>([])
    const [filteredDataTable, setFilteredData] = useState<HistoryModel[]>([])
    const [query] = useState<string>('')

    function OnSearchChange(text: string) {
        if (!text || text === '') {
            setFilteredData(dataTable)
        } else {
            const checking = (data: string): boolean => {
                return String(data || '').toLowerCase().includes(String(text || '').toLowerCase())
            }
            setFilteredData(dataTable)
            const dataTmp = dataTable.filter(x => (
                checking(x.id) ||
                checking(x.itemName) ||
                checking(x.name) ||
                checking(x.nik) ||
                checking(x.orderDate) ||
                checking(x.phoneNumber) ||
                checking(x.returnDate) ||
                checking(x.status) ||
                checking(x.updatedAt)
            ))
            if (dataTmp.length > 0) {    //memastikan fildat diperbarui jika tmp kosong
                setFilteredData(dataTmp)
            }
        }
    }

    function fetchHistory() {
        const dbRef = ref(db.database, COLLHISTORY)
        onValue(dbRef, (snapshot) => {
            const data = snapshot?.val() || []
            setDataTable(data)
            setFilteredData(data)
        }, () => {
            setDataTable([])
            setFilteredData([])
        })
    }

    useEffect(() => {
        fetchHistory()
    }, [])

    return (
        <>
            <Helmet>
                <title>
                    History Page
                </title>
            </Helmet>
            <Box
                sx={{
                    flexGrow: 1,
                    py: 8
                }}
            >
                <Container maxWidth="xl">
                    <Stack spacing={3} >
                        <div>
                            <Typography variant="h4">
                                History
                            </Typography>
                        </div>
                        <div>
                            <Grid
                                container
                                spacing={3}
                            >
                                <Grid

                                    xs={12}
                                    md={12}
                                >
                                    <Card sx={{ p: 3 }}>
                                        <Stack spacing={3}>
                                            <div>
                                                <QueryField
                                                    placeholder="Search..."
                                                    onChange={OnSearchChange}
                                                    sx={{
                                                        flexGrow: 1,
                                                        order: {
                                                            xs: 1,
                                                            sm: 2
                                                        }
                                                    }}
                                                    value={query}
                                                />
                                            </div>
                                            <div>
                                                <TableContainer component={Paper}>
                                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell align="left">No</TableCell>
                                                                <TableCell align="left">Item Name</TableCell>
                                                                <TableCell align="left">Name</TableCell>
                                                                <TableCell align="left">Nik</TableCell>
                                                                <TableCell align="left">Phone Number</TableCell>
                                                                <TableCell align="left">Updated At</TableCell>
                                                                <TableCell align="left">Order Date</TableCell>
                                                                <TableCell align="left">Return Date</TableCell>
                                                                <TableCell align="left">Price /Week</TableCell>
                                                                <TableCell align="left">Price /Month</TableCell>
                                                                <TableCell align="left">Status</TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                        {filteredDataTable && filteredDataTable.map((row, index) => (
                                                                <TableRow
                                                                    key={index}
                                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                                >
                                                                    <TableCell component="th" scope="row">
                                                                        {index + 1}
                                                                    </TableCell>
                                                                    <TableCell align="left">{row.itemName}</TableCell>
                                                                    <TableCell align="left">{row.name}</TableCell>
                                                                    <TableCell align="left">{row.nik}</TableCell>
                                                                    <TableCell align="left">{row.phoneNumber}</TableCell>
                                                                    <TableCell align="left">{row.updatedAt}</TableCell>
                                                                    <TableCell align="left">{row.orderDate}</TableCell>
                                                                    <TableCell align="left">{row.returnDate}</TableCell>
                                                                    <TableCell align="left">{Number(String(row?.pricePerWeek || '0').replace(/,/g, '')).toLocaleString()}</TableCell>
                                                                    <TableCell align="left">{Number(String(row?.pricePerMonth || '0').replace(/,/g, '')).toLocaleString()}</TableCell>
                                                                    <TableCell align="left">
                                                                        <Chip
                                                                           color={row.status === 'DONE' ? 'primary' : row.status === 'REQUEST' ? 'secondary' : 'error'}
                                                                           label={row.status}
                                                                            size="small"
                                                                            style={{
                                                                                width: '100%'
                                                                            }}
                                                                        />
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))}
                                                        </TableBody>

                                                    </Table>
                                                </TableContainer>
                                            </div>
                                        </Stack>
                                    </Card>
                                </Grid>
                            </Grid>
                            <Backdrop
                                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1, position: 'absolute' }}
                                open={false}
                            >
                                <CircularProgress color="inherit" />
                            </Backdrop>
                        </div>
                    </Stack>
                </Container>
            </Box >
        </>
    )
}

export default HistoryPage