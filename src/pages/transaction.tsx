import { Backdrop, Box, Button, Card, CircularProgress, Container, Unstable_Grid2 as Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"
import { FC, useContext, useEffect, useState } from "react"
import { Helmet } from "react-helmet-async"
import { TransactionModel } from "../models/transactionModel";
import RowExpanded from "../components/rowExpanded";
import QueryField from "../components/query-field";
import TransactionMaintenance, { MIANTENANCETRANSACTIONACTION } from "../components/transaction-maintenance";
import { DBProvider } from "../App";
import { onValue, ref } from "firebase/database";
import { COLLMASTERDATA, COLLTRANSACTION } from "../utils/GlobalVariable";
import { showMessage } from "../utils/showMessage";
import { ListNameItemModel } from "../models/statusModel";


const TransactionPage: FC = () => {
    const { db } = useContext(DBProvider)
    const [dataTable, setDataTable] = useState<TransactionModel[]>([])
    const [filteredDataTable, setFilteredData] = useState<TransactionModel[]>([])
    const [query, setQuery] = useState<string>('')
    const [selectedData, setSelectedData] = useState<TransactionModel | undefined>(undefined)
    const [showDialogMaintenance, setShowDialogMaintenance] = useState<boolean>(false)
    const [action, setAction] = useState<MIANTENANCETRANSACTIONACTION>('')

    const [listItemName, setListItemName] = useState<ListNameItemModel[]>([])

    //search data di table transaction
    function OnSearchChange(text: string) {
        setQuery(text)
        if (!text || text === '') {
            setFilteredData(dataTable)
        } else {
            const checking = (data: string): boolean => {
                return String(data || '').toLowerCase().includes(String(text || '').toLowerCase())
            }
            setFilteredData(dataTable)
            const dataTmp = dataTable.filter(x => (
                checking(x.id) ||
                checking(x.address) ||
                checking(x.itemName) ||
                checking(x.name) ||
                checking(x.nik) ||
                checking(x.orderDate) ||
                checking(x.phoneNumber) ||
                checking(x.returnDate) ||
                checking(x.status)
            ))
            if (dataTmp.length > 0) {
                setFilteredData(dataTmp)
            }
        }
    }
    //end

    //saat tombol edit di klik
    async function OnEditClick(data: TransactionModel) {
        if (data.status === 'READY') {
            await showMessage('warning', 'Warning!', 'Cant update transaction, item not in transaction!')
            return
        }
        setSelectedData(data)
        setAction('update')
        setShowDialogMaintenance(true)
    }
    //end

    //saat button add req di klik
    function OnAddTransactionClick() {
        setAction('new')
        setShowDialogMaintenance(true)
    }
    //end

    //close pop up edit transaction
    function handleCloseDialogMaintenanceTransaction() {
        setShowDialogMaintenance(false)
        setSelectedData(undefined)
    }

    //ambil data transaksi dr firebase
    async function fetchDataTransaction() {
        const dbRef = ref(db.database, COLLTRANSACTION)
        onValue(dbRef, (snapshot) => {
            const data = snapshot.val() || []
            let details: TransactionModel[] = []
            if (data) {
                const keys = Object.keys(data)
                for (const key of keys) {
                    if (!key.includes('stock')) {
                        const tmpData = { ...data[key] }
                        details = [...details, tmpData]
                    }
                }
            }
            setDataTable(details)
        }, () => {
            setDataTable([])
        })
    }
    //end

    //ambil list nama alkes di firebase
    async function fetchListItem() {
        const dbRef = ref(db.database, COLLMASTERDATA)
        let tmpDatas: ListNameItemModel[] = []  //List menyimpan data dari database
        onValue(dbRef, (snapshot) => {
            const data = snapshot.val()
            if (data) {
                const keys = Object.keys(data)
                for (const key of keys) {
                    if (key.includes('stock')) {
                        if (!tmpDatas.find(p => p.value === '')) {
                            tmpDatas = [...tmpDatas, { label: key.replace('stock', ''), value: key.replace('stock', '') }]
                        }
                    }
                }
            }
            setListItemName(tmpDatas)
        }, () => {
            setListItemName([])
        })
    }
    //end

    useEffect(() => {
        fetchDataTransaction()
        fetchListItem()
    }, [])

    useEffect(() => {
        OnSearchChange(query)
    }, [dataTable])




    return (
        <>
            <Helmet>
                <title>
                    Transaction Page
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
                                Transaction
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
                                                <Stack
                                                    alignItems="center"
                                                    direction="row"
                                                    flexWrap="wrap"
                                                    gap={3}
                                                    sx={{ p: 3 }}
                                                >
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
                                                    <Button
                                                        size="large"
                                                        variant="contained"
                                                        sx={{ order: 3 }}
                                                        onClick={OnAddTransactionClick}
                                                    >
                                                        Tambah Transaksi
                                                    </Button>
                                                </Stack>

                                            </div>
                                            <div>
                                                <TableContainer component={Paper}>
                                                    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell align="left"></TableCell>
                                                                <TableCell align="left">Items Name</TableCell>
                                                                <TableCell align="left">Status</TableCell>
                                                                {
                                                                    localStorage.getItem("access_role") === 'operator' &&
                                                                    <TableCell align="left">Action</TableCell>
                                                                }
                                                                
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {
                                                                filteredDataTable.map((row, index) => (
                                                                    <RowExpanded key={index} data={row} onAction={OnEditClick} />
                                                                ))
                                                            }
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
                            {
                                showDialogMaintenance &&
                                <TransactionMaintenance listItem={listItemName} action={action} handleClose={handleCloseDialogMaintenanceTransaction} open={showDialogMaintenance} data={selectedData} />
                            }
                        </div>
                    </Stack>
                </Container>
            </Box >
        </>
    )
}

export default TransactionPage