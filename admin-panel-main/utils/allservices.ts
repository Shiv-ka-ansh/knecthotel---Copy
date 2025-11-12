type ServiceItem = {
  id: number;
  name: string;
  displayName: string;
  imgSrc: string;
  href: string;
};

export const allServices: ServiceItem[] = [
  {
    id: 1,
    name: 'reception',
    displayName: 'Reception',
    imgSrc: '/assets/service_management_page_images/reception.svg',
    href: '/hotel-panel/service-management/reception'
  },
  {
    id: 2,
    name: 'housekeeping',
    displayName: 'Housekeeping',
    imgSrc: '/assets/service_management_page_images/housekeeping.svg',
    href: '/hotel-panel/service-management/housekeeping'
  },
  {
    id: 3,
    name: 'inroomdining',
    displayName: 'In-Room Dining',
    imgSrc: '/assets/service_management_page_images/inroomdining.svg',
    href: '/hotel-panel/service-management/inroomdining'
  },
  {
    id: 4,
    name: 'gym',
    displayName: 'Gym / Community / Conference Hall',
    imgSrc: '/assets/service_management_page_images/gym.svg',
    href: '/hotel-panel/service-management/gym'
  },
  {
    id: 5,
    name: 'spa',
    displayName: 'Spa/Salon',
    imgSrc: '/assets/service_management_page_images/spa.svg',
    href: '/hotel-panel/service-management/spa'
  },
  {
    id: 6,
    name: 'swimmingpool',
    displayName: 'Swimming Pool',
    imgSrc: '/assets/service_management_page_images/swimmingpool.svg',
    href: '/hotel-panel/service-management/swimmingpool'
  },
  {
    id: 7,
    name: 'conciergeservice',
    displayName: 'Concierge Service',
    imgSrc: '/assets/service_management_page_images/conciergeservice.svg',
    href: '/hotel-panel/service-management/conciergeservice'
  },
  {
    id: 8,
    name: 'in_room_control',
    displayName: 'In-Room Control',
    imgSrc: '/assets/service_management_page_images/inroomcontrol.svg',
    href: '/hotel-panel/service-management/in_room_control'
  },
  {
    id: 9,
    name: 'ordermanagement',
    displayName: 'Order Management',
    imgSrc: '/assets/service_management_page_images/ordermanagement.svg',
    href: '/hotel-panel/service-management/ordermanagement'
  },
  {
    id: 10,
    name: 'sos',
    displayName: 'SOS Management',
    imgSrc: '/assets/service_management_page_images/sos.svg',
    href: '/hotel-panel/service-management/sosmanagement'
  },
  {
    id: 11,
    name: 'chat',
    displayName: 'Chat With Guest',
    imgSrc: '/assets/service_management_page_images/chat.svg',
    href: '/hotel-panel/service-management/chatwithstaff'
  }
];



// Define the type for the guest data (ensure the correct type is passed)
export interface GuestDataType {
  guestId: string;
  id: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  guestName: string;
  roomNo: string;
  assignedRoomNumber?: number;
  address: string;
  paymentMode: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  paymentStatus: 'Pending' | 'Confirmed' | 'Cancelled' | string;
  status: 'Pending' | 'Confirmed' | 'Checked-In' | 'Checked-Out' | 'Cancelled' | string;
}
