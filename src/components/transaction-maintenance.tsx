import { FC, useContext, useEffect, useState } from "react";
import { TransactionModel } from "../models/transactionModel";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormHelperText, MenuItem, Stack, TextField } from "@mui/material";
import * as Yup from 'yup';
import { useFormik } from "formik";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from "dayjs";
import { confirmMessage } from "../utils/confirmMessage";
import { showMessage } from "../utils/showMessage";
import { child, get, onValue, ref, update } from "firebase/database";
import { COLLHISTORY, COLLMASTERDATA, COLLTRANSACTION, COLLTRANSACTIONKEY } from "../utils/GlobalVariable";
import { DBProvider } from "../App";
import { LISTSTATUS } from "../variables/listStatus";
import { MasterDataDetailModel, MasterDataModel } from "../models/EnrolledModel";
import moment from "moment";
import { ListNameItemModel } from "../models/statusModel";
import { v4 as uuid } from 'uuid'
import { FortSharp } from "@mui/icons-material";

export type MIANTENANCETRANSACTIONACTION = 'new' | 'update' | ''

interface TransactionMaintenanceProps {
    handleClose: () => void
    open: boolean
    data?: TransactionModel,
    action: MIANTENANCETRANSACTIONACTION
    listItem: ListNameItemModel[]
}


const initialValues = {
    id: '',
    itemName: '',
    name: '',
    nik: '',
    phoneNumber: '',
    orderDate: '',
    returnDate: '',
    status: '',
    address: '',
    submit: null,
    pricePerMonth: '',
    pricePerWeek: '',
    guidId: '',
    updatedAt: moment().format('DD/MM/YYYY')
}

const validationSchema = Yup.object({

});

const TransactionMaintenance: FC<TransactionMaintenanceProps> = ({ handleClose, open, data, action, listItem }) => {
    const { db } = useContext(DBProvider)
    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            handleSubmit({ ...values, status: 'READY' })
        }
    });

    const [transctionKey, setTransactionKey] = useState<string>('')
    const [statusField, setStatusField] = useState<string>('REQUEST')
    const [itemNameField, setItemNameField] = useState<string>('')

    const [orderDateValue, setOrderDateValue] = useState<Dayjs | null>(
        dayjs(),
    );

    const [returnDateValue, setReturnDateValue] = useState<Dayjs | null>(
        dayjs(),
    );

    // aksi klik save
    async function handleSubmit(data: TransactionModel) {
        const confirm = await confirmMessage('Are you sure to save data?')
        if (confirm) {
            if (action === 'new') {
                HanddleRequestTransaction(data)
            } else if (action === 'update') {
                HandleUpdateData(data)
            }
        }
    }
    //end

    // update data ke firebase ke transaction
    async function HandleUpdateData(formData: TransactionModel) {
        const request: { [key: string]: any } = {}
        const allTransaction: TransactionModel[] = await get(child(ref(db.database), COLLHISTORY)).then(async (item) => {
            return item.val() || []
        })
        const dataItem: MasterDataDetailModel = await get(child(ref(db.database), `${COLLMASTERDATA}/${formData.id}`)).then(async (item) => {
            return item.val()
        })
        if (!dataItem) {
            await showMessage('warning', 'RFID Not Found!', 'make sure your rfid already enrolled!')
            handleClose()
            return
        }

        const orderDate = moment(orderDateValue?.format('DD/MM/YYYY'), 'DD/MM/YYYY')
        const returnDate = moment(returnDateValue?.format('DD/MM/YYYY'), 'DD/MM/YYYY')
        let dif = returnDate.diff(orderDate, 'd')
        if (dif <= 0) {
            dif = 1
        }

        const strPrcMonth = String(dataItem?.pricePerMonth || 0).replace(/,/g, '')
        const strPrcWeek = String(dataItem?.pricePerWeek || 0).replace(/,/g, '')
        let prcMountDay = strPrcMonth && !isNaN(Number(strPrcMonth)) && Number(strPrcMonth) > 0 ? Number(strPrcMonth) / 30 : 0
        let prcWeekDay = strPrcWeek && !isNaN(Number(strPrcWeek)) && Number(strPrcWeek) > 0 ? Number(strPrcWeek) / 7 : 0
        const countBorrow = await get(child(ref(db.database), `${COLLMASTERDATA}/${transctionKey}/borrowedCount`)).then(async (item) => {
            return Number(item.val() || '0')
        })
        const stock = await get(child(ref(db.database), `${COLLMASTERDATA}/stock${formData.itemName}`)).then(async (item) => {
            return Number(item.val() || '0')
        })
        let status = ''
        if (statusField === 'PROCESS' || statusField === 'REQUEST') {
            status = 'PROCESS'
            if (statusField === 'REQUEST') {
                if (dataItem?.borrowed === '1') {
                    await showMessage('warning', 'Item in process!', 'Cant process this item')
                    handleClose()
                    return
                }
                request[`${COLLMASTERDATA}/${formData.id}/borrowedCount`] = countBorrow + 1
                request[`${COLLMASTERDATA}/stock${formData.itemName}`] = stock - 1
                request[`${COLLMASTERDATA}/${formData.id}/borrowed`] = '1'
            }
        } else if (statusField === 'CANCEL' || statusField === 'DONE') {
            status = 'READY'
            request[`${COLLMASTERDATA}/stock${formData.itemName}`] = stock + 1
            request[`${COLLMASTERDATA}/${formData.id}/borrowed`] = '0'
        }
        request[`${COLLTRANSACTION}/${data?.guidId}`] = {
            ...data, id: formData.id, guidId: data?.guidId, status: status, orderDate: orderDateValue?.format('DD/MM/YYYY'), returnDate: returnDateValue?.format('DD/MM/YYYY'), pricePerMonth: Number(prcMountDay * dif).toLocaleString(),
            pricePerWeek: Number(prcWeekDay * dif).toLocaleString(),
        }
        if (statusField === 'CANCEL' || statusField === 'DONE') {
            request[`${COLLTRANSACTION}/${data?.guidId}`] = null
        }
        request[COLLHISTORY] = allTransaction.concat(
            {
                id: formData.id,
                itemName: formData.itemName,
                name: formData.name,
                nik: formData.nik,
                phoneNumber: formData.phoneNumber,
                orderDate: orderDateValue?.format('DD/MM/YYYY'),
                returnDate: returnDateValue?.format('DD/MM/YYYY'),
                status: statusField,
                address: formData.address,
                pricePerMonth: Number(prcMountDay * dif).toLocaleString(),
                pricePerWeek: Number(prcWeekDay * dif).toLocaleString(),
                updatedAt: moment().format('DD/MM/YYYY')
            } as any
        )
        try {
            await update(ref(db.database), { ...request }).then(async () => {
                await showMessage('success', 'Success!', 'Success update transaction!')
                handleClose()
            }).catch(async (err) => {
                const message = (err as Error)?.message || 'Oppss, something when wrong!'
                await showMessage('error', 'Failed!', message)
            })
        } catch (error) {
            const message = (error as Error)?.message || 'Oppss, something when wrong!'
            await showMessage('error', 'Failed!', message)
        }

    }
    //end

    //bikin add request
    async function HanddleRequestTransaction(data: TransactionModel) {
        const request: { [key: string]: any } = {}
        const guid = uuid()
        request[`${COLLTRANSACTION}/${guid}`] = {
            ...data, guidId: guid, itemName: itemNameField, status: 'REQUEST', orderDate: orderDateValue?.format('DD/MM/YYYY'), returnDate: returnDateValue?.format('DD/MM/YYYY')
        }
        await update(ref(db.database), { ...request }).then(async () => {
            await showMessage('success', 'Success!', 'Success request transaction!')
            handleClose()
        }).catch(async (err) => {
            const message = (err as Error)?.message || 'Oppss, something when wrong!'
            await showMessage('error', 'Failed!', message)
        })
    }
    //end

    const handleChangeOrderDate = (newValue: Dayjs | null) => {
        setOrderDateValue(newValue)
    };

    const handleChangeReturnDate = (newValue: Dayjs | null) => {
        setReturnDateValue(newValue)
    };

    // ngambil transaction key dari firebase
    async function fetchTransactionKey() {
        const dbRef = ref(db.database, COLLTRANSACTIONKEY)
        onValue(dbRef, (snapshot) => {
            setTransactionKey(String(snapshot.val() || ''))
            form.setFieldValue('id', String(snapshot.val() || ''))
        }, () => {
            setTransactionKey('')
        })
    }
    //end

    //ambil data dari masterdata firebase
    async function fetchDetail() {
        form.resetForm()
        const dataItem: MasterDataModel = await get(child(ref(db.database), `${COLLMASTERDATA}/${transctionKey}`)).then(async (item) => {
            return item.val()
        })
        if (!dataItem) {
            await showMessage('warning', 'RFID Not Found!', 'make sure your rfid already enrolled!')
            handleClose()
            return
        }
        const dataTransaction: TransactionModel = await get(child(ref(db.database), `${COLLTRANSACTION}/${data?.guidId}`)).then(async (item) => {
            return item.val()
        })
        if (!dataTransaction) {
            if (!dataItem) {
                await showMessage('warning', 'RFID Not Found!', 'make sure your rfid already enrolled!')
                handleClose()
                return
            }
        } else if (dataTransaction.status !== 'REQUEST') {
            form.setFieldValue('id', transctionKey)
            form.setFieldValue('itemName', String(dataItem.alatKesehatan || ''))
            await showMessage('warning', 'Item in use!', 'Cannt create transaction with this item!')
            handleClose()
            return
        }
        form.setFieldValue('id', transctionKey)
        form.setFieldValue('itemName', String(dataTransaction.itemName || ''))
        form.setFieldValue('name', dataTransaction.name)
        form.setFieldValue('nik', dataTransaction.nik)
        form.setFieldValue('phoneNumber', dataTransaction.phoneNumber)
        form.setFieldValue('address', dataTransaction.address)
        form.setFieldValue('status', 'REQUEST')
        form.setFieldValue('pricePerMonth', dataItem.pricePerMonth)
        form.setFieldValue('pricePerWeek', dataItem.pricePerWeek)
        setOrderDateValue(dayjs(moment(dataTransaction.orderDate, 'DD/MM/YYYY').format()))
        setReturnDateValue(dayjs(moment(dataTransaction.returnDate, 'DD/MM/YYYY').format()))
        setItemNameField(String(dataTransaction.itemName || ''))
    }
    //end

    //tutup pop up
    async function closedHandle(event, reason) {
        console.log(event)
        if (reason && reason === "backdropClick") return;
        handleClose()
    }
    //end

    
    useEffect(() => {
        if (open && action === 'update' && data) {
            if (data.status === 'REQUEST') {
                fetchTransactionKey()
            } else {
                form.setFieldValue('id', data?.id)
                form.setFieldValue('itemName', data?.itemName)
                form.setFieldValue('name', data?.name)
                form.setFieldValue('nik', data?.nik)
                form.setFieldValue('phoneNumber', data?.phoneNumber)
                form.setFieldValue('address', data?.address)
                form.setFieldValue('status', data?.status)
                form.setFieldValue('pricePerMonth', data?.pricePerMonth)
                form.setFieldValue('pricePerWeek', data?.pricePerWeek)
                setOrderDateValue(dayjs(moment(data.orderDate, 'DD/MM/YYYY').format()))
                setReturnDateValue(dayjs(moment(data.returnDate, 'DD/MM/YYYY').format()))
                setStatusField(data.status)
                setItemNameField(data.itemName)
            }
        }
    }, [open, action, data])

    useEffect(() => {
        if (open && action === 'update' && transctionKey !== '' && data?.status === 'REQUEST') {
            fetchDetail()
        }
    }, [transctionKey])

    //tutup pop up
    async function onCancelClick() {
        handleClose()
    }
    //end

    return (
        <Dialog
            open={open}
            onClose={closedHandle}
            fullWidth
            maxWidth="sm"
            hideBackdrop={true}
        >
            <form onSubmit={form.handleSubmit}>
                <DialogTitle>{action === 'new' ? 'Add' : 'Update'} Data Transaction</DialogTitle>
                <Divider />
                <DialogContent>
                    <Box>
                        <Stack spacing={2}>
                            {
                                action != 'new' && (
                                    <TextField
                                        fullWidth
                                        label="RF ID"
                                        name="rfId"
                                        disabled
                                        error={Boolean(form.touched.id && form.errors.id)}
                                        value={form.values.id}
                                        helperText={form.touched.id && form.errors.id}
                                        onBlur={form.handleBlur}
                                        onChange={form.handleChange}

                                    />
                                )
                            }
                            <TextField
                                fullWidth
                                label="Item Name"
                                name="itemName"
                                onBlur={form.handleBlur}
                                onChange={(e) => {
                                    setItemNameField(e.target.value)
                                }}
                                select
                                value={itemNameField}
                                disabled={data?.status === 'REQUEST'}
                            >
                                {listItem.map((item) => (
                                    <MenuItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                error={Boolean(form.touched.name && form.errors.name)}
                                value={form.values.name}
                                helperText={form.touched.name && form.errors.name}
                                onBlur={form.handleBlur}
                                onChange={form.handleChange}
                                disabled={data?.status === 'REQUEST'}
                            />
                            <TextField
                                fullWidth
                                label="NIK"
                                name="nik"
                                error={Boolean(form.touched.nik && form.errors.nik)}
                                value={form.values.nik}
                                helperText={form.touched.nik && form.errors.nik}
                                onBlur={form.handleBlur}
                                onChange={form.handleChange}
                                disabled={data?.status === 'REQUEST'}

                            />
                            <LocalizationProvider dateAdapter={AdapterDayjs}>
                                <DesktopDatePicker
                                    label="Order Date"
                                    inputFormat="MM/DD/YYYY"
                                    value={orderDateValue}
                                    onChange={handleChangeOrderDate}
                                    renderInput={(params) => <TextField {...params} />}
                                    disabled={data?.status === 'REQUEST'}
                                />
                                <DesktopDatePicker
                                    label="Return Date"
                                    inputFormat="MM/DD/YYYY"
                                    value={returnDateValue}
                                    onChange={handleChangeReturnDate}
                                    renderInput={(params) => <TextField {...params} />}
                                    disabled={data?.status === 'REQUEST'}
                                />
                            </LocalizationProvider>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phoneNumber"
                                error={Boolean(form.touched.phoneNumber && form.errors.phoneNumber)}
                                value={form.values.phoneNumber}
                                helperText={form.touched.phoneNumber && form.errors.phoneNumber}
                                onBlur={form.handleBlur}
                                onChange={form.handleChange}
                                disabled={data?.status === 'REQUEST'}
                            />

                            <TextField
                                fullWidth
                                multiline={true}
                                label="Address"
                                name="address"
                                error={Boolean(form.touched.address && form.errors.address)}
                                value={form.values.address}
                                helperText={form.touched.address && form.errors.address}
                                onBlur={form.handleBlur}
                                onChange={form.handleChange}
                                minRows={5}
                                disabled={data?.status === 'REQUEST'}
                            />

                            <TextField
                                error={Boolean(form.touched.status && form.errors.status)}
                                fullWidth
                                helperText={form.touched.status && form.errors.status}
                                label="Status"
                                name="status"
                                onBlur={form.handleBlur}
                                onChange={(e) => {
                                    setStatusField(e.target.value)
                                }}
                                select
                                value={statusField}
                                disabled={action === 'new' || data?.status === 'REQUEST'}
                            >
                                {LISTSTATUS.filter(p => p.value !== 'READY').map((item) => (
                                    <MenuItem
                                        key={item.value}
                                        value={item.value}
                                    >
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </TextField>


                        </Stack>
                        {form.errors.submit && (
                            <FormHelperText
                                error
                                sx={{ mt: 3 }}
                            >
                                {form.errors.submit}
                            </FormHelperText>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onCancelClick}>Cancel</Button>
                    <Button type="submit">Save</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default TransactionMaintenance