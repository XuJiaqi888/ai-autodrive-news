'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import { format, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { 
  CalendarIcon, 
  PlusIcon, 
  FunnelIcon,
  ClockIcon,
  MapPinIcon,
  TagIcon,
  XMarkIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import 'react-calendar/dist/Calendar.css';

// Event Type Definitions
interface Event {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  type: 'learning' | 'personal' | 'work' | 'deadline' | 'meeting' | 'other';
  category: 'technicalSkills' | 'behavioralQuestions' | 'practicalProjects' | 'general';
  module?: string;
  priority: 'high' | 'medium' | 'low';
  location?: string;
  isRecurring: boolean;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
    daysOfWeek: number[];
  };
  reminder: {
    enabled: boolean;
    method: 'email' | 'notification';
    minutesBefore: number;
  };
  color: string;
}

interface EventForm {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  type: Event['type'];
  category: Event['category'];
  module: string;
  priority: Event['priority'];
  location: string;
  isRecurring: boolean;
  recurrence: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate: string;
    daysOfWeek: number[];
  };
  reminder: {
    enabled: boolean;
    method: 'email' | 'notification';
    minutesBefore: number;
  };
  color: string;
}

const CalendarPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day
  const [showEventModal, setShowEventModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [eventFilter, setEventFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Event form data
  const [eventForm, setEventForm] = useState<EventForm>({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    type: 'personal' as Event['type'],
    category: 'general' as Event['category'],
    module: '',
    priority: 'medium' as Event['priority'],
    location: '',
    isRecurring: false,
    recurrence: {
      frequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
      interval: 1,
      endDate: '',
      daysOfWeek: [] as number[]
    },
    reminder: {
      enabled: false,
      method: 'email' as 'email' | 'notification',
      minutesBefore: 30
    },
    color: '#3B82F6'
  });

  const eventTypes = [
    { value: 'learning' as const, label: 'Learning Session', color: '#6EE7B7' },
    { value: 'personal' as const, label: 'Personal Event', color: '#93C5FD' },
    { value: 'work' as const, label: 'Work Task', color: '#FCD34D' },
    { value: 'deadline' as const, label: 'Deadline', color: '#FCA5A5' },
    { value: 'meeting' as const, label: 'Meeting', color: '#C4B5FD' },
    { value: 'other' as const, label: 'Other', color: '#D1D5DB' }
  ];

  const priorities = [
    { value: 'high' as const, label: 'High Priority', color: '#FCA5A5' },
    { value: 'medium' as const, label: 'Medium Priority', color: '#FCD34D' },
    { value: 'low' as const, label: 'Low Priority', color: '#6EE7B7' }
  ];

  const learningCategories = [
    { value: 'technicalSkills' as const, label: 'Technical Skills' },
    { value: 'behavioralQuestions' as const, label: 'Behavioral Interview' },
    { value: 'practicalProjects' as const, label: 'Practical Projects' },
    { value: 'general' as const, label: 'General' }
  ];

  // Fetch events
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const startDate = startOfMonth(currentMonth);
      const endDate = endOfMonth(addMonths(currentMonth, 1));

      const response = await fetch(
        `/api/calendar?start=${startDate.toISOString()}&end=${endDate.toISOString()}&type=${eventFilter}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentMonth, eventFilter]);

  // Handle date selection
  const handleDateSelect = (value: any) => {
    const date = value as Date;
    setSelectedDate(date);
    setEventForm({
      ...eventForm,
      startDate: format(date, 'yyyy-MM-dd'),
      endDate: format(date, 'yyyy-MM-dd')
    });
  };

  // Get events for specific date
  const getEventsForDate = (date: Date): Event[] => {
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  // Create event
  const createEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventForm)
      });

      if (response.ok) {
        setShowEventModal(false);
        resetEventForm();
        fetchEvents();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create event');
      }
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event');
    }
  };

  // Update event
  const updateEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !selectedEvent) return;

      const response = await fetch(`/api/calendar/${selectedEvent._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(eventForm)
      });

      if (response.ok) {
        setShowEventModal(false);
        setSelectedEvent(null);
        resetEventForm();
        fetchEvents();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to update event');
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      alert('Failed to update event');
    }
  };

  // Delete event
  const deleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`/api/calendar/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setShowEventDetails(false);
        setSelectedEvent(null);
        fetchEvents();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
      alert('Failed to delete event');
    }
  };

  // Reset form
  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      startDate: format(selectedDate, 'yyyy-MM-dd'),
      endDate: format(selectedDate, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      type: 'personal',
      category: 'general',
      module: '',
      priority: 'medium',
      location: '',
      isRecurring: false,
      recurrence: {
        frequency: 'weekly',
        interval: 1,
        endDate: '',
        daysOfWeek: []
      },
      reminder: {
        enabled: false,
        method: 'email',
        minutesBefore: 30
      },
      color: '#3B82F6'
    });
  };

  // Edit event
  const editEvent = (event: Event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      description: event.description || '',
      startDate: format(new Date(event.startDate), 'yyyy-MM-dd'),
      endDate: format(new Date(event.endDate), 'yyyy-MM-dd'),
      startTime: event.startTime,
      endTime: event.endTime,
      type: event.type,
      category: event.category,
      module: event.module || '',
      priority: event.priority,
      location: event.location || '',
      isRecurring: event.isRecurring,
      recurrence: event.recurrence ? {
        frequency: event.recurrence.frequency,
        interval: event.recurrence.interval,
        endDate: event.recurrence.endDate || '',
        daysOfWeek: event.recurrence.daysOfWeek
      } : {
        frequency: 'weekly' as 'daily' | 'weekly' | 'monthly' | 'yearly',
        interval: 1,
        endDate: '',
        daysOfWeek: []
      },
      reminder: {
        enabled: event.reminder.enabled,
        method: event.reminder.method,
        minutesBefore: event.reminder.minutesBefore
      },
      color: event.color
    });
    setShowEventDetails(false);
    setShowEventModal(true);
  };

  // Custom calendar tile content
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = getEventsForDate(date);
      return (
        <div className="flex flex-col gap-1 mt-1">
          {dayEvents.slice(0, 2).map((event, index) => (
            <div
              key={index}
              className="w-full h-1.5 rounded-full"
              style={{ backgroundColor: event.color }}
            />
          ))}
          {dayEvents.length > 2 && (
            <div className="text-xs text-gray-500 font-medium">+{dayEvents.length - 2}</div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Page Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl">
                  <CalendarIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    My Calendar
                  </h1>
                  <p className="text-gray-600">Manage your schedule and events</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Event filter */}
              <div className="flex items-center space-x-3 bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm">
                <FunnelIcon className="h-5 w-5 text-gray-500" />
                <select
                  value={eventFilter}
                  onChange={(e) => setEventFilter(e.target.value)}
                  className="border-none focus:ring-0 text-sm font-medium text-gray-700 bg-transparent"
                >
                  <option value="all">All Events</option>
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add event button */}
              <button
                onClick={() => {
                  resetEventForm();
                  setSelectedEvent(null);
                  setShowEventModal(true);
                }}
                className="bg-gradient-to-r from-blue-400 to-indigo-400 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New Event
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="p-8">
                <Calendar
                  onChange={handleDateSelect}
                  value={selectedDate}
                  tileContent={tileContent}
                  className="react-calendar-enhanced"
                  onActiveStartDateChange={({ activeStartDate }) => {
                    if (activeStartDate) {
                      setCurrentMonth(activeStartDate);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Sidebar - Selected Date Events */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
                <h3 className="text-lg font-semibold text-white">
                  {format(selectedDate, 'MMMM dd, yyyy')}
                </h3>
                <p className="text-purple-100 text-sm">
                  {format(selectedDate, 'EEEE')}
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <div className="text-center py-8">
                      <CalendarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No events scheduled</p>
                      <p className="text-gray-400 text-xs">Click "New Event" to add one</p>
                    </div>
                  ) : (
                    getEventsForDate(selectedDate).map((event, index) => (
                      <div
                        key={index}
                        className="group p-4 rounded-xl border-2 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                        style={{ 
                          borderLeftColor: event.color, 
                          borderLeftWidth: '4px',
                          borderColor: event.color + '20'
                        }}
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowEventDetails(true);
                        }}
                      >
                        <h4 className="font-semibold text-gray-900 text-sm mb-2 group-hover:text-purple-600 transition-colors">
                          {event.title}
                        </h4>
                        <div className="flex items-center text-xs text-gray-600 mb-1">
                          <ClockIcon className="h-3 w-3 mr-1" />
                          {event.startTime} - {event.endTime}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-xs text-gray-500">
                            <TagIcon className="h-3 w-3 mr-1" />
                            {eventTypes.find(t => t.value === event.type)?.label}
                          </div>
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Creation/Edit Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
          <div className="relative top-10 mx-auto p-10 border w-full max-w-4xl shadow-2xl rounded-2xl bg-white mb-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900">
                {selectedEvent ? 'Edit Event' : 'Create New Event'}
              </h3>
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                  resetEventForm();
                }}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-8 max-h-96 overflow-y-auto px-2">
              {/* Basic Information */}
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({...eventForm, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                    placeholder="Enter event title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({...eventForm, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                    placeholder="Enter event description"
                  />
                </div>
              </div>

              {/* Time Settings */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({...eventForm, startDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm({...eventForm, endDate: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={(e) => setEventForm({...eventForm, startTime: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={(e) => setEventForm({...eventForm, endTime: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                  />
                </div>
              </div>

              {/* Event Properties */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Event Type
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => {
                      const selectedType = eventTypes.find(t => t.value === e.target.value as Event['type']);
                      setEventForm({
                        ...eventForm, 
                        type: e.target.value as Event['type'],
                        color: selectedType?.color || '#93C5FD'
                      });
                    }}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                  >
                    {eventTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Priority
                  </label>
                  <select
                    value={eventForm.priority}
                    onChange={(e) => setEventForm({...eventForm, priority: e.target.value as Event['priority']})}
                    className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                  >
                    {priorities.map(priority => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Learning Type Related */}
              {eventForm.type === 'learning' && (
                <div className="grid grid-cols-2 gap-8 p-6 bg-green-50 rounded-xl border border-green-100">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Learning Category
                    </label>
                    <select
                      value={eventForm.category}
                      onChange={(e) => setEventForm({...eventForm, category: e.target.value as Event['category']})}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-green-400 focus:ring-green-400 shadow-sm"
                    >
                      {learningCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Learning Module
                    </label>
                    <input
                      type="text"
                      value={eventForm.module}
                      onChange={(e) => setEventForm({...eventForm, module: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-green-400 focus:ring-green-400 shadow-sm"
                      placeholder="e.g., JavaScript Fundamentals"
                    />
                  </div>
                </div>
              )}

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Location
                </label>
                <input
                  type="text"
                  value={eventForm.location}
                  onChange={(e) => setEventForm({...eventForm, location: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                  placeholder="Enter location"
                />
              </div>

              {/* Recurring Settings */}
              <div className="border-t pt-8">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={eventForm.isRecurring}
                    onChange={(e) => setEventForm({...eventForm, isRecurring: e.target.checked})}
                    className="rounded border-gray-300 text-blue-400 focus:ring-blue-300 w-5 h-5"
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-700">Recurring Event</span>
                </label>
              </div>

              {eventForm.isRecurring && (
                <div className="bg-blue-50 p-8 rounded-xl border border-blue-100 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Frequency
                      </label>
                      <select
                        value={eventForm.recurrence.frequency}
                        onChange={(e) => setEventForm({
                          ...eventForm,
                          recurrence: {
                            ...eventForm.recurrence,
                            frequency: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly'
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Interval
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={eventForm.recurrence.interval}
                        onChange={(e) => setEventForm({
                          ...eventForm,
                          recurrence: {
                            ...eventForm.recurrence,
                            interval: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={eventForm.recurrence.endDate}
                      onChange={(e) => setEventForm({
                        ...eventForm,
                        recurrence: {
                          ...eventForm.recurrence,
                          endDate: e.target.value
                        }
                      })}
                      className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                    />
                  </div>
                </div>
              )}

              {/* Reminder Settings */}
              <div className="border-t pt-8">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={eventForm.reminder.enabled}
                    onChange={(e) => setEventForm({
                      ...eventForm,
                      reminder: {
                        ...eventForm.reminder,
                        enabled: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-blue-400 focus:ring-blue-300 w-5 h-5"
                  />
                  <span className="ml-3 text-sm font-semibold text-gray-700">Enable Reminder</span>
                </label>
              </div>

              {eventForm.reminder.enabled && (
                <div className="bg-blue-50 p-8 rounded-xl border border-blue-100 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Reminder Method
                      </label>
                      <select
                        value={eventForm.reminder.method}
                        onChange={(e) => setEventForm({
                          ...eventForm,
                          reminder: {
                            ...eventForm.reminder,
                            method: e.target.value as 'email' | 'notification'
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                      >
                        <option value="email">Email Reminder</option>
                        <option value="notification">Browser Notification</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Minutes Before
                      </label>
                      <input
                        type="number"
                        min="5"
                        value={eventForm.reminder.minutesBefore}
                        onChange={(e) => setEventForm({
                          ...eventForm,
                          reminder: {
                            ...eventForm.reminder,
                            minutesBefore: parseInt(e.target.value)
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-gray-300 focus:border-blue-400 focus:ring-blue-400 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Button Area */}
            <div className="flex justify-end space-x-6 mt-10 pt-8 border-t">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setSelectedEvent(null);
                  resetEventForm();
                }}
                className="px-8 py-3 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={selectedEvent ? updateEvent : createEvent}
                disabled={!eventForm.title || !eventForm.startDate || !eventForm.endDate}
                className="px-8 py-3 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-400 to-indigo-400 hover:from-blue-500 hover:to-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {selectedEvent ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 overflow-y-auto h-full w-full z-50 backdrop-blur-sm">
          <div className="relative top-20 mx-auto p-8 border w-full max-w-lg shadow-2xl rounded-2xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Event Details</h3>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => editEvent(selectedEvent)}
                  className="text-gray-400 hover:text-purple-600 p-2 hover:bg-purple-50 rounded-lg transition-all"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => deleteEvent(selectedEvent._id)}
                  className="text-gray-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-all"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => {
                    setShowEventDetails(false);
                    setSelectedEvent(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2" style={{ color: selectedEvent.color }}>
                  {selectedEvent.title}
                </h4>
                {selectedEvent.description && (
                  <p className="text-gray-600">{selectedEvent.description}</p>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                  <ClockIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <span>
                    {format(new Date(selectedEvent.startDate), 'MMMM dd, yyyy')} 
                    {' '}from {selectedEvent.startTime} to {selectedEvent.endTime}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <TagIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{eventTypes.find(t => t.value === selectedEvent.type)?.label}</span>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium" 
                        style={{ 
                          backgroundColor: priorities.find(p => p.value === selectedEvent.priority)?.color + '20',
                          color: priorities.find(p => p.value === selectedEvent.priority)?.color
                        }}>
                    {priorities.find(p => p.value === selectedEvent.priority)?.label}
                  </span>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                    <MapPinIcon className="h-5 w-5 mr-3 text-gray-400" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.type === 'learning' && selectedEvent.module && (
                  <div className="flex items-center text-sm text-gray-600 p-3 bg-green-50 rounded-lg border border-green-200">
                    <span className="font-semibold text-green-700">Learning Module:</span>
                    <span className="ml-2 text-green-600">{selectedEvent.module}</span>
                  </div>
                )}

                {selectedEvent.isRecurring && selectedEvent.recurrence && (
                  <div className="text-sm text-gray-600 p-3 bg-purple-50 rounded-lg border border-purple-200">
                    <span className="font-semibold text-purple-700">Recurring:</span>
                    <span className="ml-2 text-purple-600">
                      Every {selectedEvent.recurrence.interval}
                      {selectedEvent.recurrence.frequency === 'daily' && ' day(s)'}
                      {selectedEvent.recurrence.frequency === 'weekly' && ' week(s)'}
                      {selectedEvent.recurrence.frequency === 'monthly' && ' month(s)'}
                      {selectedEvent.recurrence.frequency === 'yearly' && ' year(s)'}
                    </span>
                  </div>
                )}

                {selectedEvent.reminder?.enabled && (
                  <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <span className="font-semibold text-blue-700">Reminder:</span>
                    <span className="ml-2 text-blue-600">
                      {selectedEvent.reminder.minutesBefore} minutes before
                      ({selectedEvent.reminder.method === 'email' ? 'Email' : 'Browser Notification'})
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .react-calendar-enhanced {
          width: 100% !important;
          border: none !important;
          font-family: inherit !important;
          background: transparent !important;
        }
        
        .react-calendar-enhanced .react-calendar__navigation {
          height: 60px !important;
          margin-bottom: 2rem !important;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
          border-radius: 1rem !important;
          padding: 0 1rem !important;
        }
        
        .react-calendar-enhanced .react-calendar__navigation button {
          min-width: 44px !important;
          background: none !important;
          font-size: 18px !important;
          color: white !important;
          font-weight: 600 !important;
          border-radius: 0.5rem !important;
          transition: all 0.2s !important;
        }
        
        .react-calendar-enhanced .react-calendar__navigation button:hover {
          background-color: rgba(255, 255, 255, 0.2) !important;
          transform: translateY(-1px) !important;
        }
        
        .react-calendar-enhanced .react-calendar__tile {
          max-width: 100% !important;
          padding: 12px 8px !important;
          background: none !important;
          text-align: center !important;
          line-height: 20px !important;
          font-size: 14px !important;
          border-radius: 12px !important;
          min-height: 80px !important;
          font-weight: 500 !important;
          transition: all 0.2s !important;
          border: 2px solid transparent !important;
        }
        
        .react-calendar-enhanced .react-calendar__tile:hover {
          background: linear-gradient(135deg, #bfdbfe 0%, #c7d2fe 100%) !important;
          color: #1e40af !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 25px rgba(191, 219, 254, 0.4) !important;
        }
        
        .react-calendar-enhanced .react-calendar__tile--active {
          background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%) !important;
          color: #1d4ed8 !important;
          box-shadow: 0 8px 25px rgba(219, 234, 254, 0.5) !important;
          transform: translateY(-2px) !important;
          border: 2px solid #93c5fd !important;
        }
        
        .react-calendar-enhanced .react-calendar__tile--now {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%) !important;
          color: #8b4513 !important;
          font-weight: 700 !important;
          border: 2px solid #ff9500 !important;
        }
        
        .react-calendar-enhanced .react-calendar__month-view__weekdays {
          text-align: center !important;
          text-transform: uppercase !important;
          font-weight: 700 !important;
          font-size: 12px !important;
          color: #6b7280 !important;
          margin-bottom: 1rem !important;
        }
        
        .react-calendar-enhanced .react-calendar__month-view__weekdays__weekday {
          padding: 12px !important;
          background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important;
          border-radius: 8px !important;
          margin: 0 2px !important;
        }
      `}</style>
    </div>
  );
};

export default CalendarPage; 