import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Card, Button, Spin, message, Input, Form, Space } from 'antd';
import { EditOutlined, SaveOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const HostelRules = () => {
  const [rules, setRules] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  // Section titles and their corresponding icons
  const sections = [
    {
      key: 'general_rules',
      title: 'General Rules',
      description: 'General rules and regulations for hostel residents',
      placeholder: 'Enter a general rule (e.g., Maintain silence in study hours)',
      format: 'array'
    },
    {
      key: 'mess_timings',
      title: 'Mess Timings',
      description: 'Meal timings and related rules',
      placeholder: 'Format: [Meal Type]: [Time] (e.g., Breakfast: 7:30 AM - 9:00 AM)',
      format: 'keyvalue'
    },
    {
      key: 'gate_timings',
      title: 'Gate Timings',
      description: 'Entry and exit timings',
      placeholder: 'Format: [Timing Type]: [Time] (e.g., In Time: 10:00 PM)',
      format: 'keyvalue'
    },
    {
      key: 'prohibited_items',
      title: 'Prohibited Items',
      description: 'Items not allowed in the hostel',
      placeholder: 'Enter a prohibited item (e.g., Electric heaters, Alcohol)',
      format: 'array'
    },
    {
      key: 'consequences',
      title: 'Consequences',
      description: 'Penalties for rule violations',
      placeholder: 'Enter a consequence (e.g., Fine of ₹500 for first violation)',
      format: 'array'
    }
  ];

  // Fetch hostel rules
  const fetchRules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('hostel_rules')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is the code for no rows returned
      
      if (data) {
        console.log('Fetched data:', data); // Debug log
        setRules(data);
        
        // Initialize form with data from the database
        const formValues = {};
        
        // Handle general_rules (array of strings)
        if (Array.isArray(data.general_rules)) {
          formValues.general_rules = data.general_rules.map(text => ({ text }));
        }
        
        // Handle mess_timings (object)
        if (data.mess_timings && typeof data.mess_timings === 'object') {
          formValues.mess_timings = Object.entries(data.mess_timings).map(([key, value]) => ({
            text: `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`
          }));
        }
        
        // Handle gate_timings (object)
        if (data.gate_timings && typeof data.gate_timings === 'object') {
          formValues.gate_timings = Object.entries(data.gate_timings).map(([key, value]) => ({
            text: `${key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}: ${value}`
          }));
        }
        
        // Handle prohibited_items (array of strings)
        if (Array.isArray(data.prohibited_items)) {
          formValues.prohibited_items = data.prohibited_items.map(text => ({ text }));
        }
        
        // Handle consequences (array of strings)
        if (Array.isArray(data.consequences)) {
          formValues.consequences = data.consequences.map(text => ({ text }));
        }
        
        console.log('Form values:', formValues); // Debug log
        form.setFieldsValue(formValues);
      } else {
        // If no data exists, initialize with empty arrays
        const initialValues = {};
        sections.forEach(section => {
          initialValues[section.key] = [];
        });
        form.setFieldsValue(initialValues);
      }
    } catch (error) {
      console.error('Error fetching hostel rules:', error);
      message.error('Failed to load hostel rules');
    } finally {
      setLoading(false);
    }
  };

  // Save rules
  const saveRules = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      // Convert form values to the expected format
      const rulesData = {
        general_rules: values.general_rules
          ?.filter(item => item?.text?.trim())
          .map(item => item.text.trim()) || [],
          
        mess_timings: values.mess_timings?.reduce((acc, item) => {
          if (item?.text) {
            const [key, ...valueParts] = item.text.split(':').map(s => s.trim());
            if (key && valueParts.length > 0) {
              acc[key.toLowerCase()] = valueParts.join(':').trim();
            }
          }
          return acc;
        }, {}),
        
        gate_timings: values.gate_timings?.reduce((acc, item) => {
          if (item?.text) {
            const [key, ...valueParts] = item.text.split(':').map(s => s.trim());
            if (key && valueParts.length > 0) {
              const normalizedKey = key.toLowerCase().replace(/ /g, '_');
              acc[normalizedKey] = valueParts.join(':').trim();
            }
          }
          return acc;
        }, {}),
        
        prohibited_items: values.prohibited_items
          ?.filter(item => item?.text?.trim())
          .map(item => item.text.trim()) || [],
          
        consequences: values.consequences
          ?.filter(item => item?.text?.trim())
          .map(item => item.text.trim()) || []
      };
      
      console.log('Saving data:', rulesData); // Debug log

      // Check if we're updating existing rules or creating new ones
      const { data, error } = rules?.id 
        ? await supabase
            .from('hostel_rules')
            .update(rulesData)
            .eq('id', rules.id)
            .select()
            .single()
        : await supabase
            .from('hostel_rules')
            .insert([rulesData])
            .select()
            .single();

      if (error) throw error;
      
      setRules(data);
      setEditing(false);
      message.success('Rules updated successfully');
    } catch (error) {
      console.error('Error saving rules:', error);
      message.error('Failed to save rules');
    } finally {
      setLoading(false);
    }
  };

  // Add a new rule item
  const addItem = (section) => {
    const items = form.getFieldValue(section) || [];
    form.setFieldsValue({
      [section]: [...items, { text: '' }]
    });
    // Focus the new input field
    setTimeout(() => {
      const inputs = document.querySelectorAll(`[name^="${section}"]`);
      if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
      }
    }, 0);
  };

  // Remove a rule item
  const removeItem = (section, index) => {
    const items = form.getFieldValue(section) || [];
    form.setFieldsValue({
      [section]: items.filter((_, i) => i !== index)
    });
    // Show success message
    message.success('Rule removed successfully');
  };

  useEffect(() => {
    fetchRules();
  }, []);

  if (loading && !rules) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Hostel Rules</h1>
        {editing ? (
          <Space>
            <Button onClick={() => {
              form.resetFields();
              setEditing(false);
            }}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={saveRules}
              loading={loading}
            >
              Save Changes
            </Button>
          </Space>
        ) : (
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => setEditing(true)}
          >
            Edit Rules
          </Button>
        )}
      </div>

      <Form form={form} layout="vertical">
        <div className="space-y-6">
          {sections.map(section => (
            <Card
              key={section.key}
              title={section.title}
              className="mb-6"
              extra={
                editing && (
                  <Button 
                    type="text" 
                    icon={<PlusOutlined />} 
                    onClick={() => addItem(section.key)}
                  >
                    Add Rule
                  </Button>
                )
              }
            >
              <Form.List name={section.key}>
                {(fields, { add, remove }) => (
                  <div className="space-y-2">
                    {fields.map(({ key, name, ...restField }) => (
                      <div key={key} className="flex items-start gap-2">
                        <Form.Item
                          {...restField}
                          name={[name, 'text']}
                          rules={[{ required: true, message: 'Please input a rule' }]}
                          className="flex-1 mb-0"
                        >
                          <Input.TextArea 
                            autoSize={{ minRows: 1, maxRows: 4 }} 
                            disabled={!editing}
                            placeholder={section.placeholder}
                            className="w-full"
                          />
                        </Form.Item>
                        {editing && (
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => removeItem(section.key, name)}
                            className="mt-1"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Form.List>
              {!editing && (!form.getFieldValue(section.key)?.length ? (
                <div className="p-4 bg-gray-50 rounded">
                  <p className="text-gray-500 text-center">No {section.title.toLowerCase()} added yet. Click 'Edit Rules' to add some.</p>
                </div>
              ) : (
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  {form.getFieldValue(section.key)?.map((item, idx) => (
                    <li key={idx} className="text-gray-700">{item.text}</li>
                  ))}
                </ul>
              ))}
            </Card>
          ))}
        </div>
      </Form>
    </div>
  );
};

export default HostelRules;
