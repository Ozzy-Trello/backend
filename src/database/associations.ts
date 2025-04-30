import CardAttachment, { initCardAttachmentAssociations } from './schemas/card_attachment';
import File, { initFileAssociations } from './schemas/file';
import Card from './schemas/card';
import User from './schemas/user';

export function initializeAssociations() {
  console.log('Initializing database associations...');
  initFileAssociations();
  
  // Initialize card attachment associations
  initCardAttachmentAssociations();
  
  // Setup reciprocal associations
  File.hasMany(CardAttachment, {
    foreignKey: 'file_id',
    as: 'attachments'
  });
  
  Card.hasMany(CardAttachment, {
    foreignKey: 'card_id',
    as: 'attachments'
  });
  console.log("CardAttachment", CardAttachment.associations);
  console.log("File", File.associations);
  
  console.log('Database associations initialized successfully');
}