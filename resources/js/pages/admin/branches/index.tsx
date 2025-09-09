import AdminLayout from '@/layouts/admin/admin-layout'
import { Head, Link } from '@inertiajs/react'
import { BreadcrumbItem } from '@/types';
import { Building, Edit, Plus } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { maskPhone } from '@/Utils/mask';
import moment from 'moment';
import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('admin.dashboard'),
  },
  {
    title: 'Filiais',
    href: "#",
  },
];

export default function BranchesIndex({ branches }: any) {
  return (
    <AdminLayout>
      <Head title="Filiais" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Building} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Filiais</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>
      <div className='flex items-center justify-between p-4'>
        <div>
          <InputSearch placeholder="Buscar filial" url="admin.branches.index" />
        </div>
        <div>
          <Button variant="default" asChild>
            <Link href={route('admin.branches.create')}>
              <Plus />
              Empresa
            </Link>
          </Button>
        </div>
      </div>

      <div className='p-4'>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Cadastro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches?.data.length > 0 ?
                branches?.data?.map((branche: any) => (
                  <TableRow key={branche.id}>
                    <TableCell>{branche.id}</TableCell>
                    <TableCell>{branche.company_name}</TableCell>
                    <TableCell>{branche.company_cnpj}</TableCell>
                    <TableCell>{branche.contact_email}</TableCell>
                    <TableCell>{maskPhone(branche.contact_phone)}</TableCell>
                    <TableCell>{moment(branche.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>

                      <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href={route('admin.branches.edit', branche.id)}>
                          <Edit />
                        </Link>
                      </Button>

                      <ActionDelete title={'esta empresa'} url={'admin.branches.destroy'} param={branche.id} />

                    </TableCell>
                  </TableRow>
                ))
                : (
                  <TableRow>
                    <TableCell colSpan={7} className='h-16 w-full flex items-center justify-center'>
                      Não há dados a serem mostrados no momento.
                    </TableCell>
                  </TableRow>
                )
              }
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={8}>
                  <AppPagination data={branches} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

    </AdminLayout>
  )
}
