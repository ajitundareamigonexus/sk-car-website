'use client';

import { useState } from 'react';
import { Car, Plus, Edit3, Trash2 } from 'lucide-react';
import { saveCab, updateLocalCab, deleteLocalCab } from '@/lib/bookingStore';
import type { Cab } from '@/lib/types';

interface AdminFleetProps {
  cabs: any[];
  setRefreshKey: React.Dispatch<React.SetStateAction<number>>;
}

export default function AdminFleet({ cabs, setRefreshKey }: AdminFleetProps) {
  const [showCabModal, setShowCabModal] = useState(false);
  const [editingCab, setEditingCab] = useState<any>(null);
  const [cabForm, setCabForm] = useState({
    name: '', car: '', seats: 4, bags: 2, basePrice: 1000, rating: 4.8, fuelType: 'Petrol', ac: true, image: ''
  });

  const openAddCab = () => {
    setEditingCab(null);
    setCabForm({ name: '', car: '', seats: 4, bags: 2, basePrice: 1000, rating: 4.8, fuelType: 'Petrol', ac: true, image: '' });
    setShowCabModal(true);
  };

  const openEditCab = (cab: any) => {
    setEditingCab(cab);
    setCabForm({
      name: cab.name, car: cab.car, seats: cab.seats, bags: cab.bags,
      basePrice: cab.basePrice, rating: cab.rating, fuelType: cab.fuelType, ac: cab.ac, image: cab.image || ''
    });
    setShowCabModal(true);
  };

  const handleSaveCab = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      /*
      if (editingCab) {
        await updateCab(editingCab.id, cabForm);
      } else {
        await addCab(cabForm);
      }
      */
      const typedCabForm: Omit<Cab, 'id'> = {
        ...cabForm,
        fuelType: cabForm.fuelType as 'CNG' | 'Diesel' | 'Petrol' | 'Electric',
      };
      if (editingCab) {
        updateLocalCab(editingCab.id, typedCabForm);
      } else {
        saveCab(typedCabForm);
      }
      setShowCabModal(false);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("Failed to save cab", err);
      alert("Failed to save cab.");
    }
  };

  const handleDeleteCab = async (id: number) => {
    if (!confirm("Are you sure you want to delete this cab?")) return;
    try {
      /*
      await deleteCab(id);
      */
      deleteLocalCab(id);
      setRefreshKey(k => k + 1);
    } catch (err) {
      console.error("Failed to delete cab", err);
      alert("Failed to delete cab.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">Fleet Management</h2>
          <p className="text-sm text-muted">Manage the cars available for booking</p>
        </div>
        <button
          onClick={openAddCab}
          className="flex items-center gap-2 bg-teal-400 text-black px-4 py-2 rounded-xl text-sm font-bold hover:scale-[1.02] transition-transform shadow-md shadow-teal-400/20 cursor-pointer"
        >
          <Plus size={16} /> Add New Car
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cabs.map(cab => (
          <div key={cab.id} className="rounded-2xl border border-card-border bg-card p-5 relative group">
            <div className="absolute top-4 right-4 flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditCab(cab)} className="p-2 bg-blue-400/10 text-blue-400 rounded-lg hover:bg-blue-400 hover:text-white transition-colors cursor-pointer">
                <Edit3 size={14} />
              </button>
              <button onClick={() => handleDeleteCab(cab.id)} className="p-2 bg-red-400/10 text-red-400 rounded-lg hover:bg-red-400 hover:text-white transition-colors cursor-pointer">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="w-12 h-12 rounded-xl bg-teal-400/10 flex items-center justify-center mb-4">
              <Car size={24} className="text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-teal-400">{cab.name}</h3>
            <p className="text-sm text-muted mb-4">{cab.car}</p>

            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div><span className="text-muted">Seats:</span> {cab.seats}</div>
              <div><span className="text-muted">Bags:</span> {cab.bags}</div>
              <div><span className="text-muted">Fuel:</span> {cab.fuelType}</div>
              <div><span className="text-muted">AC:</span> {cab.ac ? 'Yes' : 'No'}</div>
            </div>

            <div className="mt-4 pt-4 border-t border-card-border flex justify-between items-center">
              <span className="text-xl font-black text-foreground">₹{cab.basePrice}</span>
              <span className="text-xs text-muted">/ trip base</span>
            </div>
          </div>
        ))}
        {cabs.length === 0 && (
          <div className="col-span-full text-center py-12 border border-dashed border-border rounded-2xl">
            <p className="text-muted">No cars added yet. Add your first car!</p>
          </div>
        )}
      </div>

      {/* ── Add/Edit Cab Modal ── */}
      {showCabModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-card border border-card-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-card-border">
              <h3 className="text-xl font-bold">{editingCab ? 'Edit Car' : 'Add New Car'}</h3>
            </div>
            <form onSubmit={handleSaveCab} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1">Display Name (e.g., Premium Sedan)</label>
                  <input required value={cabForm.name} onChange={e => setCabForm({ ...cabForm, name: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-muted mb-1">Car Model (e.g., Honda City)</label>
                  <input required value={cabForm.car} onChange={e => setCabForm({ ...cabForm, car: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Seats</label>
                  <input required type="number" value={cabForm.seats} onChange={e => setCabForm({ ...cabForm, seats: parseInt(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Bags</label>
                  <input required type="number" value={cabForm.bags} onChange={e => setCabForm({ ...cabForm, bags: parseInt(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Base Price (₹)</label>
                  <input required type="number" value={cabForm.basePrice} onChange={e => setCabForm({ ...cabForm, basePrice: parseFloat(e.target.value) })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted mb-1">Fuel Type</label>
                  <select value={cabForm.fuelType} onChange={e => setCabForm({ ...cabForm, fuelType: e.target.value })} className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400">
                    <option>Petrol</option>
                    <option>Diesel</option>
                    <option>CNG</option>
                    <option>Electric</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center gap-2 mt-2">
                  <input type="checkbox" id="ac" checked={cabForm.ac} onChange={e => setCabForm({ ...cabForm, ac: e.target.checked })} className="w-4 h-4 accent-teal-400" />
                  <label htmlFor="ac" className="text-sm font-semibold select-none cursor-pointer">Has Air Conditioning (AC)</label>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-card-border mt-6">
                <button type="button" onClick={() => setShowCabModal(false)} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-background cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl bg-teal-400 text-black text-sm font-bold shadow-md shadow-teal-400/20 cursor-pointer">{editingCab ? 'Update Car' : 'Save Car'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
