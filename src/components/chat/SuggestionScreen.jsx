import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CHAT_API_URL } from "../../config/api";
import { useLocation } from 'react-router-dom';

function DoctorFloatingPanel({ sseData }) {
  if (!sseData || sseData.type !== "doctor_list" || !sseData.data?.length) {
    console.log(sseData);
    
    return null;
  }

  return (
    <div className="fixed h-[70%] bg-white rounded-xl shadow-lg  w-[25%] top-2/5 right-10 -translate-y-1/2 z-50">
      <div className="w-full p-4">
        <div className="flex justify-between mb-2">
        <h3 className="text-sm font-semibold mb-2">Suggested Doctors</h3>
        <p>Seel all</p>
        </div>

        <div className="grid grid-flow-col grid-rows-2 gap-3 overflow-x-auto scrollbar-hide">
          {sseData.data.map((doctor) => (
            <div
              key={doctor._id}
              className="min-w-[320px] flex-shrink-0 border rounded-lg p-3 flex gap-3 items-center"
            >
              {/* Doctor Image */}
              <img
                src="/chat/doctor_image_doctors_suggestion_list.png"
                alt="Doctor"
                className="w-10 h-10 rounded-full object-cover"
              />

              {/* Doctor Info */}
              <div className="flex-1">
                <p className="text-sm font-medium">{doctor.name}</p>
                <p className="text-xs text-gray-500">
                  {doctor.specialization}
                </p>
                <p className="text-xs text-gray-400">
                  9:30 AM – 10:30 AM
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button className="text-gray-600 hover:text-green-600 cursor-pointer">
                  <img src="/chat/call_icon_doctors_suggestion_list.png" width={12} height={12} alt="" />
                </button>
                <button className="text-gray-600 hover:text-blue-600 cursor-pointer">
                  <img src="/chat/video_call_icon_doctors_suggestion_list.png" width={12} height={12} alt="" />
                </button>
                <button className="text-gray-600 hover:text-purple-600 cursor-pointer">
                  <img src="/chat/message_icon_doctors_suggestion_list.png" width={12} height={12} alt="" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SuggestionScreen() {
  const location = useLocation();
  const params = useParams();
  const thread_id = params.thread_id;
  const [doctorList, setDoctorList] = useState(null);

  useEffect(() => {
    if (!thread_id) return;

    // Check localStorage for existing parsed_data, otherwise initialize with []
    const storedData = localStorage.getItem(`doctor_list_${thread_id}`);
    if (storedData) {
      try {
        const parsedStoredData = JSON.parse(storedData);
        setDoctorList(parsedStoredData);
        if (location.pathname.split("/")[1] === "private") localStorage.removeItem(`doctor_list_${thread_id}`);
      } catch (error) {
        console.error("Error parsing stored doctor list:", error);
        setDoctorList([]);
      }
    } else {
      setDoctorList([]);
    }

    const eventSource = new EventSource(`${CHAT_API_URL}/sse/${thread_id}`);

    eventSource.onmessage = (event) => {
      const parsed_data = JSON.parse(event.data);
      if (parsed_data.type === "doctor_list") {
        // Store parsed_data in localStorage
        localStorage.setItem(`doctor_list_${thread_id}`, JSON.stringify(parsed_data));
        setDoctorList(parsed_data);
      }
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [thread_id]);

  return (
    <div>
      <DoctorFloatingPanel sseData={doctorList} />
    </div>
  );
}

export default SuggestionScreen;
