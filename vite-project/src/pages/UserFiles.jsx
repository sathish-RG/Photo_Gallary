// src/pages/UserFiles.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserContent } from '../api/adminApi';
import { toast } from 'react-toastify';

const UserFiles = () => {
  const { id } = useParams(); // user id
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const res = await getUserContent(id);
      setData(res.data.data);
    } catch (err) {
      console.error('Error fetching user content', err);
      toast.error('Failed to load user content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (!data) return <div className="p-8">No data available.</div>;

  const { user, folders, media } = data;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Files for {user.username}</h1>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Folders</h2>
        {folders.length === 0 ? (
          <p>No folders.</p>
        ) : (
          <ul className="list-disc pl-5">
            {folders.map((folder) => (
              <li key={folder._id}>{folder.name}</li>
            ))}
          </ul>
        )}
      </section>
      <section>
        <h2 className="text-xl font-semibold mb-2">Media</h2>
        {media.length === 0 ? (
          <p>No media files.</p>
        ) : (
          <ul className="list-disc pl-5">
            {media.map((item) => (
              <li key={item._id}>{item.filePath} ({item.fileType})</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default UserFiles;
