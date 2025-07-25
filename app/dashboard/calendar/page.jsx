import GlobalStoreCalendar from '@/components/GlobalStoreCalendar';
import BasicHeader from '@/components/BasicHeader';

export default function CalendarPage() {
  return (
    <div className="container mx-auto p-4">
      <BasicHeader 
        title="График на всички магазини"
        subtitle="Преглед на всички планирани проверки и доставки"
      />
      
      <div className="mt-6">
        <GlobalStoreCalendar />
      </div>
    </div>
  );
} 