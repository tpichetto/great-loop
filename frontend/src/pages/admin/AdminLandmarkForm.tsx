import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { landmarkAPI } from '../../services/api';
import type { LandmarkCategory } from '../../types';
import './AdminLandmarkForm.css';

export function AdminLandmarkForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState<LandmarkCategory>('attraction');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [tags, setTags] = useState('');
  const [priceLevel, setPriceLevel] = useState<1 | 2 | 3 | 4 | undefined>(undefined);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (id) {
      const fetchLandmark = async () => {
        try {
          const landmark = await landmarkAPI.fetchById(id);
          setName(landmark.name);
          setDescription(landmark.description);
          setShortDescription(landmark.shortDescription);
          setCategory(landmark.category);
          setLatitude(landmark.latitude.toString());
          setLongitude(landmark.longitude.toString());
          setAddress(landmark.address);
          setPhone(landmark.phone || '');
          setWebsite(landmark.website || '');
          setTags(landmark.tags.join(', '));
          setPriceLevel(landmark.priceLevel);
        } catch (err) {
          setMessage({ type: 'error', text: 'Failed to load landmark' });
        }
      };
      fetchLandmark();
    }
  }, [id]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required';
    }
    if (!latitude || isNaN(parseFloat(latitude))) {
      newErrors.latitude = 'Valid latitude is required';
    }
    if (!longitude || isNaN(parseFloat(longitude))) {
      newErrors.longitude = 'Valid longitude is required';
    }
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!validate()) {
      return;
    }

    setIsSaving(true);

    try {
      // TODO: Implement API call to create/update landmark
      setMessage({
        type: 'success',
        text: isEditing ? 'Landmark updated successfully!' : 'Landmark created successfully!',
      });
      setTimeout(() => navigate('/admin/landmarks'), 1500);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to save landmark',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const categories: LandmarkCategory[] = [
    'attraction',
    'restaurant',
    'park',
    'museum',
    'historic',
    'nature',
    'entertainment',
    'shopping',
  ];

  return (
    <div className="admin-form-page">
      <div className="page-header">
        <h1 className="page-title">{isEditing ? 'Edit Landmark' : 'Create Landmark'}</h1>
        <p className="page-subtitle">
          {isEditing ? 'Update landmark information' : 'Add a new landmark to the database'}
        </p>
      </div>

      <form className="admin-form" onSubmit={handleSubmit}>
        {message && <div className={`message ${message.type}`}>{message.text}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name *
            </label>
            <input
              type="text"
              id="name"
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving}
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category *
            </label>
            <select
              id="category"
              className="form-input"
              value={category}
              onChange={(e) => setCategory(e.target.value as LandmarkCategory)}
              disabled={isSaving}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="shortDescription" className="form-label">
              Short Description *
            </label>
            <textarea
              id="shortDescription"
              className={`form-input ${errors.shortDescription ? 'error' : ''}`}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              disabled={isSaving}
              rows={2}
            />
            {errors.shortDescription && (
              <span className="field-error">{errors.shortDescription}</span>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="description" className="form-label">
              Full Description *
            </label>
            <textarea
              id="description"
              className={`form-input ${errors.description ? 'error' : ''}`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSaving}
              rows={4}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="latitude" className="form-label">
              Latitude *
            </label>
            <input
              type="number"
              step="any"
              id="latitude"
              className={`form-input ${errors.latitude ? 'error' : ''}`}
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              disabled={isSaving}
              placeholder="e.g., 40.7128"
            />
            {errors.latitude && <span className="field-error">{errors.latitude}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="longitude" className="form-label">
              Longitude *
            </label>
            <input
              type="number"
              step="any"
              id="longitude"
              className={`form-input ${errors.longitude ? 'error' : ''}`}
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              disabled={isSaving}
              placeholder="e.g., -74.0060"
            />
            {errors.longitude && <span className="field-error">{errors.longitude}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="address" className="form-label">
              Address *
            </label>
            <input
              type="text"
              id="address"
              className={`form-input ${errors.address ? 'error' : ''}`}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isSaving}
            />
            {errors.address && <span className="field-error">{errors.address}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone" className="form-label">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              className="form-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSaving}
            />
          </div>

          <div className="form-group">
            <label htmlFor="website" className="form-label">
              Website
            </label>
            <input
              type="url"
              id="website"
              className="form-input"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              disabled={isSaving}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="priceLevel" className="form-label">
              Price Level
            </label>
            <select
              id="priceLevel"
              className="form-input"
              value={priceLevel || ''}
              onChange={(e) =>
                setPriceLevel(
                  e.target.value ? (parseInt(e.target.value) as 1 | 2 | 3 | 4) : undefined,
                )
              }
              disabled={isSaving}
            >
              <option value="">Not specified</option>
              <option value="1">$ - Budget</option>
              <option value="2">$$ - Moderate</option>
              <option value="3">$$$ - Upscale</option>
              <option value="4">$$$$ - Luxury</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label htmlFor="tags" className="form-label">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              id="tags"
              className="form-input"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isSaving}
              placeholder="e.g., historic, architecture, landmark"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/landmarks')}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? 'Saving...' : isEditing ? 'Update Landmark' : 'Create Landmark'}
          </button>
        </div>
      </form>
    </div>
  );
}
