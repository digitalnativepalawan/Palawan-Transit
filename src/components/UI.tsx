import React from 'react';
import { Drawer, Button } from '@mui/material';

const UIDrawer = ({ isOpen, toggleDrawer, setShowBookings, onAdminClick }) => {
    return (
        <Drawer anchor="right" open={isOpen} onClose={toggleDrawer}>
            <div style={{ width: 250 }}>
                <Button onClick={toggleDrawer}>TRANSPORT</Button>
                <Button onClick={toggleDrawer}>ISLAND HOPPING</Button>
                <Button onClick={() => { toggleDrawer(); setShowBookings(true); }}>MY BOOKINGS</Button>
                <Button onClick={() => { toggleDrawer(); onAdminClick('Operator Login'); }}>OPERATOR PORTAL</Button>
            </div>
        </Drawer>
    );
};

export default UIDrawer;