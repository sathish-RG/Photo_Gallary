import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiClock, FiSave, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { getScheduleEvents, createScheduleEvent, updateScheduleEvent, deleteScheduleEvent } from '../api/scheduleEventApi';

const EnhancedSchedule = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('month'); // month or list
  const [formData, setFormData] = useState({
    eventName: '',
    date: '',
    startTime: '',
    endTime: '',
    description: '',
    isAvailable: true,
    color: '#3b82f6',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await getScheduleEvents();
      setEvents(response.data);
    } catch (error) {
      toast.error('Failed to load schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateScheduleEvent(editingEvent._id, formData);
        toast.success('Event updated successfully');
      } else {
        await createScheduleEvent(formData);
        toast.success('Event created successfully');
      }
      fetchEvents();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteScheduleEvent(id);
      toast.success('Event deleted');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const openModal = (event = null, date = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        eventName: event.eventName,
        date: event.date.split('T')[0],
        startTime: event.startTime,
        endTime: event.endTime,
        description: event.description || '',
        isAvailable: event.isAvailable,
        color: event.color,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        eventName: '',
        date: date || selectedDate,
        startTime: '09:00',
        endTime: '10:00',
        description: '',
        isAvailable: true,
        color: '#3b82f6',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingEvent(null);
  };

  const getEventsForDate = (date) => {
    return events.filter(e => e.date.split('T')[0] === date);
  };

  // Generate calendar grid for current month
  const generateCalendar = () => {
    const year = new Date(selectedDate).getFullYear();
    const month = new Date(selectedDate).getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    return days;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const changeMonth = (offset) => {
    const current = new Date(selectedDate);
    current.setMonth(current.getMonth() + offset);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const calendarDays = generateCalendar();
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Enhanced Schedule</h1>
          <p className="text-slate-600">Manage your calendar and events</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'month' ? 'list' : 'month')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {viewMode === 'month' ? 'List View' : 'Calendar View'}
          </button>
          <Button onClick={() => openModal()} className="flex items-center gap-2">
            <FiPlus className="w-5 h-5" />
            Add Event
          </Button>
        </div>
      </div>

      {viewMode === 'month' ? (
        <Card className="p-6">
          {/* Month Navigation */}
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => changeMonth(-1)}
              className="px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              ← Previous
            </button>
            <h2 className="text-xl font-bold text-slate-800">{formatDate(selectedDate)}</h2>
            <button
              onClick={() => changeMonth(1)}
              className="px-4 py-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Next →
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Day headers */}
            {daysOfWeek.map(day => (
              <div key={day} className="text-center font-semibold text-slate-600 py-2">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              if (!date) {
                return <div key={`empty-${index}`} className="min-h-24 bg-slate-50 rounded-lg" />;
              }

              const dateStr = date.toISOString().split('T')[0];
              const dayEvents = getEventsForDate(dateStr);
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={dateStr}
                  onClick={() => openModal(null, dateStr)}
                  className={`min-h-24 border rounded-lg p-2 cursor-pointer hover:bg-slate-50 transition-colors ${isToday ? 'border-primary border-2' : 'border-slate-200'
                    }`}
                >
                  <div className="font-semibold text-sm text-slate-700 mb-1">{date.getDate()}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map(event => (
                      <div
                        key={event._id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(event);
                        }}
                        className="text-xs p-1 rounded truncate"
                        style={{ backgroundColor: event.color + '20', color: event.color }}
                      >
                        {event.startTime} {event.eventName}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-slate-500">+{dayEvents.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        // List View
        <div className="space-y-3">
          {events.length === 0 ? (
            <Card className="p-12 text-center">
              <FiCalendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No events scheduled</p>
            </Card>
          ) : (
            events.map(event => (
              <Card key={event._id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: event.color }}
                      />
                      <h3 className="text-lg font-bold text-slate-800">{event.eventName}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${event.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                        {event.isAvailable ? 'Available' : 'Blocked'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <FiCalendar className="w-4 h-4" />
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <FiClock className="w-4 h-4" />
                        {event.startTime} - {event.endTime}
                      </span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-slate-600 mt-2">{event.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(event)}
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <FiEdit2 className="w-4 h-4 text-slate-600" />
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingEvent ? 'Edit Event' : 'Add New Event'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.eventName}
                  onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  placeholder="e.g., Wedding Shoot, Client Meeting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2"
                  rows={3}
                  placeholder="Optional notes..."
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-700">Available for booking</span>
                </label>

                <label className="flex items-center gap-2">
                  <span className="text-sm text-slate-700">Color:</span>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-10 h-10 rounded border border-slate-300"
                  />
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="button" onClick={closeModal} variant="secondary" className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingEvent ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedSchedule;
