import { AdminHeader } from './AdminHeader';
import { Header } from '../../components/Header';
import { Outlet } from "react-router";

export function AdminPage() {

    return (
        <>
            <title>Admin</title>
            <Header />
            <AdminHeader />
            <Outlet />
        </>
    );
}