import ChartPieIcon from "@heroicons/react/24/solid/ChartPieIcon"
import DocumentTextIcon from "@heroicons/react/24/solid/DocumentTextIcon"
import ShoppingCartIcon from "@heroicons/react/24/solid/ShoppingCartIcon"
import { SvgIcon } from '@mui/material';
import { ClipboardDocumentCheckIcon } from '@heroicons/react/24/solid'

export const items = [
  {
    href: '/',
    icon: (
      <SvgIcon>
        <ChartPieIcon />
      </SvgIcon>
    ),
    label: ''
  },
  {
    href: '/master',
    icon: (
      <SvgIcon>
        <ClipboardDocumentCheckIcon />
      </SvgIcon>
    ),
    label: ''
  },
  {
    href: '/transaction',
    icon: (
      <SvgIcon>
        <ShoppingCartIcon />
      </SvgIcon>
    ),
    label: ''
  },
  {
    href: '/history',
    icon: (
      <SvgIcon>
        <DocumentTextIcon />
      </SvgIcon>
    ),
    label: ''
  },
];
