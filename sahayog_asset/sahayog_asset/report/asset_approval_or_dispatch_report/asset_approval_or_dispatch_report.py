# Copyright (c) 2023, Sid and contributors
# For license information, please see license.txt

import frappe

def execute(filters=None):
    if not filters:
        filters = {}
    
    data, columns = [], []

    columns = get_columns()
    cs_data = get_cs_data(filters)

    if not cs_data:
        frappe.msgprint('No Records Found')
        return columns, data

    for d in cs_data:
        row = {
            'name': d.name
        }
        data.append(row)

    return columns, data

def get_columns():
    return [
        {
            'fieldname': 'name',
            'label': 'ID',
            'fieldtype': 'Link',
             'options': 'Asset Request',
            'width': '150'
        }
    ]

def get_cs_data(filters):
    conditions = get_conditions(filters)
    data = frappe.get_all(
        doctype='Asset Request',
        fields=['name'],
        filters=conditions,
        order_by='name desc'
    )
    return data

def get_conditions(filters):
    conditions = {}
    for key, value in filters.items():
        if value:
            conditions[key] = value
    return conditions
