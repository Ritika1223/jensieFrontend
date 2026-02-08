import { useState, useEffect } from "react";
import { Plus, Trash2, Download } from "lucide-react";

const emptyMedicine = () => ({
  name: "",
  dosage: "",
  frequency: "",
  duration: "",
  instructions: "",
});

export default function PrescriptionsPage() {
  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [patientGender, setPatientGender] = useState("");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split("T")[0]);
  const [diagnosis, setDiagnosis] = useState("");
  const [medicines, setMedicines] = useState([emptyMedicine()]);
  const [notes, setNotes] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [doctorReg, setDoctorReg] = useState("");

  useEffect(() => {
    try {
      const details = localStorage.getItem("doctorDetails");
      if (details) {
        const d = JSON.parse(details);
        if (d?.name) setDoctorName(d.name);
        if (d?.registration) setDoctorReg(d.registration);
      }
    } catch (_) {}
  }, []);

  const addMedicine = () => setMedicines((prev) => [...prev, emptyMedicine()]);
  const removeMedicine = (idx) =>
    setMedicines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev));
  const updateMedicine = (idx, field, value) =>
    setMedicines((prev) =>
      prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m))
    );

  const handleDownload = () => {
    window.print();
  };

  return (
    <main className="flex-1 bg-[#F8F8F8] p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="no-print flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Create Prescription</h1>
        </div>

        {/* Form */}
        <div className="no-print bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-base font-medium text-gray-700 mb-4">Patient Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Patient Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="Full name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Age</label>
              <input
                type="text"
                value={patientAge}
                onChange={(e) => setPatientAge(e.target.value)}
                placeholder="e.g. 35"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Gender</label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date of Visit</label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1">Diagnosis / Condition</label>
            <input
              type="text"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="e.g. Common Cold, Hypertension"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Medicines */}
          <h2 className="text-base font-medium text-gray-700 mb-4">Medicines</h2>
          <div className="space-y-4 mb-6">
            {medicines.map((med, idx) => (
              <div
                key={idx}
                className="p-4 border border-gray-200 rounded-lg space-y-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Medicine {idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeMedicine(idx)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Name</label>
                    <input
                      type="text"
                      value={med.name}
                      onChange={(e) => updateMedicine(idx, "name", e.target.value)}
                      placeholder="Medicine name"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Dosage</label>
                    <input
                      type="text"
                      value={med.dosage}
                      onChange={(e) => updateMedicine(idx, "dosage", e.target.value)}
                      placeholder="e.g. 500mg"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Frequency</label>
                    <input
                      type="text"
                      value={med.frequency}
                      onChange={(e) => updateMedicine(idx, "frequency", e.target.value)}
                      placeholder="e.g. Twice daily"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-0.5">Duration</label>
                    <input
                      type="text"
                      value={med.duration}
                      onChange={(e) => updateMedicine(idx, "duration", e.target.value)}
                      placeholder="e.g. 7 days"
                      className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-0.5">Special Instructions</label>
                  <input
                    type="text"
                    value={med.instructions}
                    onChange={(e) => updateMedicine(idx, "instructions", e.target.value)}
                    placeholder="e.g. Take after meals"
                    className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm"
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addMedicine}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus size={16} />
              Add Medicine
            </button>
          </div>

          <div className="mb-6">
            <label className="block text-sm text-gray-600 mb-1">Additional Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional instructions..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <h2 className="text-base font-medium text-gray-700 mb-4">Doctor Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Doctor Name</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. Name"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Registration No.</label>
              <input
                type="text"
                value={doctorReg}
                onChange={(e) => setDoctorReg(e.target.value)}
                placeholder="e.g. MCI-12345"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition no-print"
          >
            <Download size={18} />
            Download / Print Prescription
          </button>
        </div>

        {/* Prescription preview - visible on screen and printed */}
        <div className="prescription-preview bg-white p-8 border border-gray-200 rounded-xl shadow-sm">
          <style>{`
            @media print {
              .no-print { display: none !important; }
              .prescription-preview { box-shadow: none !important; border: 1px solid #ccc !important; }
              main { padding: 0 !important; background: white !important; }
              .prescription-preview { break-inside: avoid; }
            }
          `}</style>
          <div className="text-center border-b border-gray-300 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">PRESCRIPTION</h1>
            <p className="text-sm text-gray-600 mt-1">Jensei Healthcare</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm">
            <div>
              <p><strong>Patient Name:</strong> {patientName || "—"}</p>
              <p><strong>Age:</strong> {patientAge || "—"}</p>
              <p><strong>Gender:</strong> {patientGender || "—"}</p>
            </div>
            <div className="sm:text-right">
              <p><strong>Date of Visit:</strong> {visitDate || "—"}</p>
              <p><strong>Diagnosis:</strong> {diagnosis || "—"}</p>
            </div>
          </div>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-3 py-2 text-left">#</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Medicine Name</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Dosage</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Frequency</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Duration</th>
                <th className="border border-gray-300 px-3 py-2 text-left">Instructions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((med, idx) => (
                <tr key={idx}>
                  <td className="border border-gray-300 px-3 py-2">{idx + 1}</td>
                  <td className="border border-gray-300 px-3 py-2">{med.name || "—"}</td>
                  <td className="border border-gray-300 px-3 py-2">{med.dosage || "—"}</td>
                  <td className="border border-gray-300 px-3 py-2">{med.frequency || "—"}</td>
                  <td className="border border-gray-300 px-3 py-2">{med.duration || "—"}</td>
                  <td className="border border-gray-300 px-3 py-2">{med.instructions || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {notes && (
            <p className="text-sm mb-6"><strong>Notes:</strong> {notes}</p>
          )}
          <div className="mt-8 pt-6 border-t border-gray-300">
            <p className="text-sm"><strong>Doctor Name:</strong> {doctorName || "—"}</p>
            <p className="text-sm"><strong>Registration No:</strong> {doctorReg || "—"}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
