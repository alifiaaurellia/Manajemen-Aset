import { Helmet } from 'react-helmet-async';
import ShoppingBagIcon from '@heroicons/react/24/solid/ShoppingBagIcon';
import ShoppingCartIcon from '@heroicons/react/24/solid/ShoppingCartIcon';
import CurrencyDollarIcon from '@heroicons/react/24/solid/CurrencyDollarIcon';
import {
  Avatar,
  Box,
  Container,
  Stack,
  SvgIcon,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';
import OverviewSummary from '../sections/overview/overview-summary';
import OverviewKpi from '../sections/overview/overview-kpi';
import { useContext, useEffect, useState } from 'react';
import { DBProvider } from '../App';
import { COLLHISTORY, COLLMASTERDATA, COLLTRANSACTION } from '../utils/GlobalVariable';
import { onValue, ref } from 'firebase/database';
interface DetailReveneuModel {

  label: string,
  value: string

}
const Page = () => {
  const { db } = useContext(DBProvider)

  const [mostItemBorrowed, setMostItemBorrowed] = useState<string[]>([])
  const [revenue, setRevenue] = useState<Number[]>([])
  const [detailRevenue, setDetailRevenue] = useState<DetailReveneuModel[]>()
  const [totalProduct, setTotalProduct] = useState<Number>(0)
  const [totalDone, setTotalDone] = useState<Number>(0)
  const [totalProcess, setTotalProcess] = useState<Number>(0)

  // untuk ambil data yang paling banyak dipinjam   begin
  async function GetMostBorowed() {
    const dbRef = ref(db.database, COLLMASTERDATA)
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val()
      let details: { [key: string]: number } = {}
      let tmpTotalProduct = 0
      if (data) {
        const keys = Object.keys(data)
        for (const key of keys) {
          if (!key.includes('stock')) {
            const count = Number(data[key]['borrowedCount'] || 0)
            if (details[data[key]['alatKesehatan']]) {
              details[data[key]['alatKesehatan']] = details[data[key]['alatKesehatan']] + count
            } else {
              details[data[key]['alatKesehatan']] = count
            }
          } else {
            tmpTotalProduct += Number(data[key])
          }
        }
      }
      const objectKey = Object.keys(details)
      let listRevenue: Number[] = []
      const detailRevenues: DetailReveneuModel[] = []
      for (const key of objectKey) {
        detailRevenues.push({
          label: key,
          value: String(details[key])
        })
        listRevenue = [...listRevenue, details[key]]
      }
      detailRevenues.sort((p, x) => (Number(x.value) - Number(p.value)))
      if (detailRevenues.length > 5) {
        setDetailRevenue(detailRevenues.slice(0, 5))
      } else {
        setDetailRevenue(detailRevenues)
      }
      setTotalProduct(tmpTotalProduct)
      setRevenue(listRevenue)
      setMostItemBorrowed(objectKey)
    }, () => {
    })
  }
  //end

  //Ambil History
  async function GetHistory() {
    const dbRef = ref(db.database, COLLHISTORY)
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val()
      let tmpDoneTransaction = 0
      if (data) {
        const keys = Object.keys(data)
        for (const key of keys) {
          if (data[key].status === 'DONE') {
            tmpDoneTransaction += 1
          }
        }
      }
      setTotalDone(tmpDoneTransaction)
    }, () => {
    })
  }
  //end

  //ambil transaksi yang yg masih proses
  async function GetProcessTransaction() {
    const dbRef = ref(db.database, COLLTRANSACTION)
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val()
      let tmpProcessTransaction = 0
      if (data) {
        const keys = Object.keys(data)
        for (const key of keys) {
          if (data[key].status === 'PROCESS') {
            tmpProcessTransaction += 1
          }
        }
      }
      setTotalProcess(tmpProcessTransaction)
    }, () => {
    })
  }
  //end

  //
  useEffect(() => {
    GetMostBorowed()
    GetHistory()
    GetProcessTransaction()
  }, [])
  return <>
    <Helmet>
      <title>
        Overview | Carpatin Free
      </title>
    </Helmet>
    <Box
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <div>
            <Typography variant="h4">
              Reports
            </Typography>
          </div>
          <div>
            <Grid
              container
              spacing={3}
            >
              <Grid
                xs={12}
                md={4}
              >
                <OverviewSummary
                  icon={
                    <Avatar
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        height: 56,
                        width: 56
                      }}
                    >
                      <SvgIcon>
                        <ShoppingCartIcon />
                      </SvgIcon>
                    </Avatar>
                  }
                  label='Assets'
                  value={String(totalProduct)}
                />
              </Grid>
              <Grid
                xs={12}
                md={4}
              >

                <OverviewSummary
                  icon={
                    <Avatar
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        height: 56,
                        width: 56
                      }}
                    >
                      <SvgIcon>
                        <ShoppingBagIcon />
                      </SvgIcon>
                    </Avatar>
                  }
                  label='Done Transactions'
                  value={String(totalDone)}
                />
              </Grid>

              <Grid
                xs={12}
                md={4}
              >
                <OverviewSummary
                  icon={
                    <Avatar
                      sx={{
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                        height: 56,
                        width: 56
                      }}
                    >
                      <SvgIcon>
                        <CurrencyDollarIcon />
                      </SvgIcon>
                    </Avatar>
                  }
                  label='Rented'
                  value={String(totalProcess)}
                />
              </Grid>
              <Grid xs={12}>
                <OverviewKpi
                  chartSeries={[
                    {
                      data: revenue,
                      name: 'Revenue'
                    }
                  ]}
                  stats={detailRevenue}
                  categories={mostItemBorrowed}
                />
              </Grid>
            </Grid>
          </div>
        </Stack>
      </Container>
    </Box>
  </>
};

export default Page;
