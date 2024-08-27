import { Box, Button, Divider, FormHelperText, Stack, TextField } from "@mui/material";
import { FC, useContext, useEffect } from "react"
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { showMessage } from "../utils/showMessage";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { COLLENROLLEDKEY, COLLENROLLESTATUS, COLLMASTERDATA, FIELDALATKESEHATAN } from "../utils/GlobalVariable";
import moment from "moment";
import { MasterDataDetailModel } from "../models/EnrolledModel";
import { confirmMessage } from "../utils/confirmMessage";
import { child, get, onValue, ref, update } from "firebase/database";
import { DBProvider } from "../App";
import { TransactionModel } from "../models/transactionModel";
import { NumericFormat } from 'react-number-format';


export type MAINTENANCEITEMACTION = 'add' | 'update' | '' | 'delete'

export interface AddItemProps {
    open: boolean
    handleClose: () => void,
    action: MAINTENANCEITEMACTION,
    selectedData?: MasterDataDetailModel
}

const initialValues = {
    enrolledKey: '',
    alatKesehatan: '',
    stock: 0,
    pricePerWeek: '',
    pricePerMonth: '',
    submit: null
}

const validationSchema = Yup.object({
    enrolledKey: Yup
        .string()
        .max(255)
        .required('Enrolled Key is required'),
    alatKesehatan: Yup
        .string()
        .max(255)
        .required('Alat Kesehatan is required'),
   
});

interface AddItemForm {
    enrolledKey: string
    alatKesehatan: string
    stock: number
    pricePerWeek: string
    pricePerMonth: string
}

const MaintenanceItem: FC<AddItemProps> = ({ open, handleClose, action, selectedData }) => {
    const { db } = useContext(DBProvider)

    const form = useFormik({
        initialValues,
        validationSchema,
        onSubmit: async (values) => {
            handleSubmit({ ...values })
        }
    });

    //Untuk add item di master data
    async function handleAddData(data: AddItemForm) {
        const confirm = await confirmMessage('Are you sure to save data?')
        if (confirm) {
            if (await checkRfIdExists(data.enrolledKey)) {
                await showMessage('warning', 'Warning!', 'RFID Already enrolled!')
                return
            }
            let isExists = false
            let stock = 1
            isExists = await get(child(ref(db.database), `${COLLMASTERDATA}`)).then((res) => {
                if (res.exists()) {
                    let listData: string[] = []
                    res.forEach((item) => {
                        if (item.exists()) {
                            const tmpItem = item.val()
                            listData = [...listData, tmpItem[FIELDALATKESEHATAN]]
                        }
                    })
                    if (listData.find(p => String(p ?? '').toLocaleLowerCase() === String(data?.alatKesehatan ?? '').toLocaleLowerCase())) return true
                    return false
                }
                return false
            })
            if (isExists) {
                await get(child(ref(db.database), `${COLLMASTERDATA}/stock${data.alatKesehatan}`)).then((res) => {
                    stock = Number(res.val() || 0) + 1
                })
            }
            const req: { [key: string]: any } = {}
            req[`${COLLMASTERDATA}/${data.enrolledKey}`] = { ...data, createdAd: moment().format('DD/MM/YYYY HH:mm:ss'), isReady: true, borrowedCount: 0 }
            req[`${COLLMASTERDATA}/stock${data.alatKesehatan}`] = stock
           
            await update(ref(db.database), { ...req }).then(async () => {
                await showMessage('success', 'Success', 'Success enrolled new data!')
                setIsEnrolled('0')
                handleClose()
            }).catch((err) => {
                const message = (err as Error)?.message || 'something when worng!'
                showMessage('error', 'Error!', message)
            })
        }
    }
    //end

    //untuk aksi update data
    async function handleUpdateData(data: AddItemForm) {
        const confirm = await confirmMessage('Are you sure to save data?')
        if (confirm) {
            if (!await checkRfIdExists(data.enrolledKey)) {
                await showMessage('warning', 'Warning!', 'RFID not found!')
                return
            }
            const oldData: MasterDataDetailModel = await get(child(ref(db.database), `${COLLMASTERDATA}/${data.enrolledKey}`)).then((res) => {
                return res.val()
            })
            if (!oldData) {
                await showMessage('warning', 'Warning!', 'RFID not found!')
                return
            }
            const stock = Number(await getStock(oldData.alatKesehatan) || '0')
            const request: { [key: string]: any } = {}
            if (String(oldData?.alatKesehatan || '').toLocaleLowerCase() !== String(data?.alatKesehatan).toLocaleLowerCase()) {
                request[`${COLLMASTERDATA}/stock${oldData.alatKesehatan}`] = stock - 1
                request[`${COLLMASTERDATA}/stock${data.alatKesehatan}`] = Number(await getStock(data.alatKesehatan) || '0') + 1
            }
            const detail = {
                ...oldData,
                ...data
            }
            request[`${COLLMASTERDATA}/${oldData.enrolledKey}`] = { ...detail }
            if (stock - 1 <= 0) {
                request[`${COLLMASTERDATA}/stock${oldData.alatKesehatan}`] = null
            }
            await update(ref(db.database), { ...request }).then(async () => {
                await showMessage('success', 'Success', 'Success updated data!')
                setIsEnrolled('0')
                handleClose()
            }).catch((err) => {
                const message = (err as Error)?.message || 'Oppss, something when wrong!'
                showMessage('error', 'Error!', message)
            })
        }
        return
    }
    //end

    //ambil jumlah stok dr firebase
    async function getStock(name: string) {
        return await get(child(ref(db.database), `${COLLMASTERDATA}/stock${name}`)).then((res) => {
            return res.val()
        })
    }
    //end

    //buat hapus data di masterdata
    async function handleDeleteData(data: AddItemForm) {
        const confirm = await confirmMessage('Are you sure to delete data?')
        if (confirm) {
            if (!await checkRfIdExists(data.enrolledKey)) {
                await showMessage('warning', 'Warning!', 'RFID not found!')
                return
            }
            const oldData: MasterDataDetailModel = await get(child(ref(db.database), `${COLLMASTERDATA}/${data.enrolledKey}`)).then((res) => {
                return res.val()
            })
            if (!oldData) {
                await showMessage('warning', 'Warning!', 'RFID not found!')
                return
            }
            const stock = Number(await getStock(data.alatKesehatan) || '0')
            const request: { [key: string]: any } = {}
            request[`${COLLMASTERDATA}/${data.enrolledKey}`] = null
            request[`${COLLMASTERDATA}/stock${oldData.alatKesehatan}`] = stock - 1 <= 0 ? null : stock - 1
            await update(ref(db.database), { ...request }).then(async () => {
                await showMessage('success', 'Success', 'Success deleted data!')
                setIsEnrolled('0')
                handleClose()
            }).catch((err) => {
                const message = (err as Error)?.message || 'Oppss, something when wrong!'
                showMessage('error', 'Error!', message)
            })
        }
        return
    }
    //end

    //aksi klik save
    async function handleSubmit(data: AddItemForm) {
        if (action === 'add') {
            handleAddData(data)
        } else if (action === 'update') {
            handleUpdateData(data)
        } else if (action === 'delete') {
            handleDeleteData(data)
        }
    }
    //end

    //check rfid atau blm di frbase
    async function checkRfIdExists(rfId: string) {
        return await get(child(ref(db.database), `${COLLMASTERDATA}/${rfId}`)).then((res) => {
            if (res.exists()) {
                return true
            }
            return false
        })
    }
    //end

    //ubah jadi enroll key jadi 0
    async function setIsEnrolled(val: string) {
        const request: { [key: string]: any } = {}
        request[`${COLLENROLLESTATUS}`] = val
        if (val === '0') {
            request[COLLENROLLEDKEY] = ''
        }
        update(ref(db.database), request)
    }
    //end

    //ambil enroll key dari firebase
    async function fetchEnrolledKey() {
        const dbRef = ref(db.database, COLLENROLLEDKEY)
        onValue(dbRef, (snapshot) => {
            form.setFieldValue('enrolledKey', String(snapshot.val()))
        }, () => {
            form.setFieldValue('enrolledKey', '')
        })
    }
    //end

    //tutup popup close
    async function closedHandle(event, reason) {
        console.log(event)
        if (reason && reason === "backdropClick") return;
        await setIsEnrolled('0')
        handleClose()
    }
    //end

    //tutup popup close
    async function onCancelClick() {
        await setIsEnrolled('0')
        handleClose()
    }
    //end
    
    useEffect(() => {
        form.resetForm()
        if (open && action === 'add') {
            setIsEnrolled('1')
            fetchEnrolledKey()
        } else if (open && (action === 'update' || action === 'delete') && selectedData) {
            form.setFieldValue('enrolledKey', selectedData?.enrolledKey)
            form.setFieldValue('alatKesehatan', selectedData?.alatKesehatan)
            form.setFieldValue('pricePerWeek', String(selectedData?.pricePerWeek))
            form.setFieldValue('pricePerMonth', String(selectedData?.pricePerMonth))
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, action, selectedData])
    return (
        <Dialog
            open={open}
            onClose={closedHandle}
            fullWidth
            maxWidth="sm"
            hideBackdrop={true}
        >
            <form onSubmit={form.handleSubmit}>
                <DialogTitle>Add Item</DialogTitle>
                <Divider />
                <DialogContent>
                    <Box>

                        <Stack spacing={3}>
                            <TextField
                                fullWidth
                                label="Enrolled Key"
                                name="enrolledKey"
                                disabled
                                error={Boolean(form.touched.enrolledKey && form.errors.enrolledKey)}
                                value={form.values.enrolledKey}
                                helperText={form.touched.enrolledKey && form.errors.enrolledKey}
                                onBlur={form.handleBlur}
                                onChange={form.handleChange}
                            />
                            <TextField
                                fullWidth
                                label="Alat Kesehatan"
                                name="alatKesehatan"
                                error={Boolean(form.touched.alatKesehatan && form.errors.alatKesehatan)}
                                value={form.values.alatKesehatan}
                                helperText={form.touched.alatKesehatan && form.errors.alatKesehatan}
                                onBlur={form.handleBlur}
                                onChange={form.handleChange}
                                disabled={action === 'delete'}

                            />
                            <NumericFormat
                                customInput={TextField}
                                allowLeadingZeros={false}
                                thousandSeparator=","
                                // onValueChange={form.handleChange}
                                label="Price/ Week"
                                name="pricePerWeek"
                                error={Boolean(form.touched.pricePerWeek && form.errors.pricePerWeek)}
                                value={form.values.pricePerWeek}
                                helperText={form.touched.pricePerWeek && form.errors.pricePerWeek}
                                onBlur={form.handleBlur}
                                onChange={form.handleChange}
                                disabled={action === 'delete'}
                            />
                            <NumericFormat
                                customInput={TextField}
                                allowLeadingZeros={false}
                                thousandSeparator=","
                                // onValueChange={form.handleChange}
                                label="Price/ Month"
                                name="pricePerMonth"
                                error={Boolean(form.touched.pricePerMonth && form.errors.pricePerMonth)}
                                value={form.values.pricePerMonth}
                                helperText={form.touched.pricePerMonth && form.errors.pricePerMonth}
                                onBlur={form.handleBlur}
                                onChange={form.handleChange}
                                disabled={action === 'delete'}
                            />


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
                    <Button type="submit">{action === 'delete' ? 'Delete' : 'Save'}</Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}

export default MaintenanceItem