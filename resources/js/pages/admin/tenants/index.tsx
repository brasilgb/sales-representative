import AdminLayout from '@/layouts/admin/admin-layout'
import { Head, Link } from '@inertiajs/react'
import { BreadcrumbItem } from '@/types';
import { Building, Building2, Edit, Plus } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import InputSearch from '@/components/inputSearch';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { maskPhone } from '@/Utils/mask';
import moment from 'moment';
import ActionDelete from '@/components/action-delete';
import AppPagination from '@/components/app-pagination';
import { statusSaasByValue } from '@/Utils/functions';

const breadcrumbs: BreadcrumbItem[] = [
  {
    title: 'Dashboard',
    href: route('admin.dashboard'),
  },
  {
    title: 'Empresas',
    href: "#",
  },
];

export default function TenantsIndex({  tenants }: any) {

  return (
    <AdminLayout>
      <Head title="Empresas" />
      <div className='flex items-center justify-between h-16 px-4'>
        <div className='flex items-center gap-2'>
          <Icon iconNode={Building} className='w-8 h-8' />
          <h2 className="text-xl font-semibold tracking-tight">Empresas</h2>
        </div>
        <div>
          <Breadcrumbs breadcrumbs={breadcrumbs} />
        </div>
      </div>
      <div className='flex items-center justify-between p-4'>
        <div>
          <InputSearch placeholder="Buscar empresa" url="admin.tenants.index" />
        </div>
        <div>
          <Button variant="default" asChild>
            <Link href={route('admin.tenants.create')}>
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
                <TableHead>Criação</TableHead>
                <TableHead>Vencimento</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants?.data.length > 0 ?
                tenants?.data?.map((tenant: any) => (
                  <TableRow key={tenant.id}>
                    <TableCell>{tenant.id}</TableCell>
                    <TableCell>{tenant.company_name}</TableCell>
                    <TableCell>{tenant.company_cnpj}</TableCell>
                    <TableCell>{tenant.contact_email}</TableCell>
                    <TableCell>{maskPhone(tenant.contact_phone)}</TableCell>
                    <TableCell>{statusSaasByValue(tenant.status)}</TableCell>
                    <TableCell>{moment(tenant.created_at).format("DD/MM/YYYY")}</TableCell>
                    <TableCell>{moment(tenant.expiration_date).format("DD/MM/YYYY")}</TableCell>
                    <TableCell className='flex justify-end gap-2'>

                      {/* <Button asChild size="icon" className="bg-sky-500 hover:bg-sky-600 text-white">
                        <Link href={route('admin.branches.index', { tn: tenant.id })}>
                          <Building2 className="h-4 w-4" />
                        </Link>
                      </Button> */}

                      <Button asChild size="icon" className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Link href={route('admin.tenants.edit', tenant.id)}>
                          <Edit />
                        </Link>
                      </Button>

                      <ActionDelete title={'esta empresa'} url={'admin.tenants.destroy'} param={tenant.id} />

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
                <TableCell colSpan={9}>
                  <AppPagination data={tenants} />
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

    </AdminLayout>
  )
}
