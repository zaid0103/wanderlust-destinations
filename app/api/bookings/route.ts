import { NextResponse } from 'next/server';
import prisma from '@/app/libs/prismadb';
import getCurrentUser from '@/app/actions/getCurrentUser';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.error();
    }

    const body = await request.json();
    const { propertyId, startDate, endDate, guests, totalPrice } = body;

    const booking = await prisma.booking.create({
      data: {
        propertyId,
        userId: currentUser.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        guests,
        totalPrice,
      },
    });

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.error();
  }
}
